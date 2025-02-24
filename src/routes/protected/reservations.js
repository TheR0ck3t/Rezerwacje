const express = require('express');
const router = express.Router();
const db = require('../../modules/dbModules/db');
const authToken = require('../../modules/authModules/authToken');
const { sendReservationConfirmationEmail } = require('../../services/mailing');

// Wczytywanie rezerwacji
router.get('/', authToken, async(req, res) => {
    const user = req.user;
    try {
        // Pobieranie rezerwacji użytkownika z bazy danych
        const reservations = await db.query('SELECT * FROM reservations WHERE user_id = $1', [user.id]);

        // Sprawdź, czy są jakiekolwiek rezerwacje
        if (!reservations || reservations.length === 0) {
            return res.status(200).json([]); // Zwracamy pustą tablicę, jeśli brak rezerwacji
        }

        // Pobieranie danych pokoju dla każdej rezerwacji
        const reservationsWithRoomDetails = await Promise.all(reservations.map(async(reservation) => {
            const room = await db.oneOrNone('SELECT details, price_per_1h FROM rooms WHERE id = $1', [reservation.room_id]);
            if (room) {
                reservation.room_name = room.details.name;
                reservation.price_per_1h = room.price_per_1h;
                // Obliczanie całkowitej ceny rezerwacji
                const startTime = new Date(reservation.start_time);
                const endTime = new Date(reservation.end_time);
                const durationInHours = (endTime - startTime) / (1000 * 60 * 60); // Konwersja milisekund na godziny
                reservation.total_price = durationInHours * room.price_per_1h;
            } else {
                reservation.room_name = 'Nieznany pokój';
                reservation.total_price = 0;
            }
            return reservation;
        }));

        res.status(200).json(reservationsWithRoomDetails); // Zwracamy rezerwacje z danymi pokoju i całkowitą ceną
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// Tworzenie rezerwacji
router.post('/create', authToken, async(req, res) => {
    const { roomId, start, end, notes } = req.body;
    const userId = req.user.id;

    try {
        // Sprawdzenie dostępności pokoju
        const overlappingReservations = await db.query(
            `SELECT * FROM reservations 
            WHERE room_id = $1 AND (
                (start_time < $2 AND end_time > $3) OR
                (start_time BETWEEN $3 AND $2) OR
                (end_time BETWEEN $3 AND $2)
            )`, [roomId, end, start]
        );

        if (overlappingReservations.length > 0) {
            return res.status(400).json({ error: 'Wybrany pokój jest już zarezerwowany w podanych terminach.' });
        }

        // Pobieranie ceny za godzinę pokoju
        const room = await db.oneOrNone('SELECT price_per_1h FROM rooms WHERE id = $1', [roomId]);
        if (!room) {
            return res.status(404).json({ error: 'Pokój nie znaleziony.' });
        }

        // Obliczanie całkowitej ceny rezerwacji
        const startTime = new Date(start);
        const endTime = new Date(end);
        const durationInHours = (endTime - startTime) / (1000 * 60 * 60); // Konwersja milisekund na godziny
        const totalPrice = durationInHours * parseInt(room.price_per_1h); // Parsowanie ceny na liczbę całkowitą przez typ danych zwracany z bazy

        // Tworzenie rezerwacji w bazie danych
        await db.query(
            `INSERT INTO reservations (user_id, room_id, start_time, end_time, status, notes, total_price, created_at) 
            VALUES ($1, $2, $3, $4, 'pending', $5, $6, NOW())`, [userId, roomId, start, end, notes, totalPrice]
        );

        // Wysyłanie potwierdzenia rezerwacji
        if (process.env.MAIL_ENABLED === 'true') {
            await sendReservationConfirmationEmail(req.user.email);
        } else {
            console.log('Reservation confirmation email not sent due to MAIL_ENABLED environment variable set to false');
        }
        res.json({ message: 'Reservation successful', redirect: '/thank-you' });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Nie udało się utworzyć rezerwacji.' });
    }
});


// Anulowanie rezerwacji
router.delete('/:id', authToken, async(req, res) => {
    const user = req.user;
    const { id } = req.params;
    try {
        // Usunięcie rezerwacji z bazy danych
        await db.query('DELETE FROM reservations WHERE id = $1 AND user_id = $2', [id, user.id]);
        res.status(200).json({ message: 'Booking deleted' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

module.exports = {
    path: '/reservations',
    router,
    routeName: 'reservations'
};