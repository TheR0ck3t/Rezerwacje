const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../../modules/dbModules/db');
const authToken = require('../../modules/authModules/authToken');
const { hashPassword, comparePasswords } = require('../../modules/authModules/userAuth');

router.use((req, res, next) => {
    res.locals.isProtected = true;
    const pathParts = req.path.split('/');
    res.locals.currentPage = pathParts[1] || '';
    next();
});

// Dynamic route creation based on files in views/protected
const viewsPath = path.resolve(__dirname, '../../views/protected');
fs.readdirSync(viewsPath).forEach(file => {
    if (file.endsWith('.ejs')) {
        const routeName = file.split('.')[0];
        router.get(`/${routeName}`, authToken, (req, res) => {
            res.render(path.join(viewsPath, file), {
                user: req.user.email || null,
                currentPage: routeName,
            });
        });
    }
});

router.get('/user', authToken, async(req, res) => {
    const user = req.user; // Zakładamy, że middleware `authToken` dodaje dane użytkownika do `req.user`
    try {
        // Pobieranie danych użytkownika z bazy danych
        const result = await db.oneOrNone('SELECT first_name, last_name, phone_number FROM users WHERE id = $1', [user.id]);
        if (!result) {
            return res.status(404).json({ error: 'User not found uwu' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
    try {
        // Przygotowanie danych do wysłania
        const responseData = {
            firstName: user.first_name || null, // Imię (jeśli istnieje)
            lastName: user.last_name || null, // Nazwisko (jeśli istnieje)
            email: user.email || null, // Email (zawsze wymagany)
            phoneNumber: user.phone_number || null // Numer telefonu (jeśli istnieje)
        };

        // Wysłanie danych użytkownika
        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.put('/user/info', authToken, async(req, res) => {
    const user = req.user;
    const { firstName, lastName, phoneNumber } = req.body;
    // Walidacja danych
    if (!firstName || !lastName || !phoneNumber) {
        return res.status(400).json({ error: 'Missing first name, last name or phone number' });
    }
    // Zaktualizowanie danych w bazie danych
    try {
        await db.query('UPDATE users SET first_name = $1, last_name = $2, phone_number = $3 WHERE id = $4', [firstName, lastName, phoneNumber, user.id]);
        res.status(200).json({ message: 'Personal information updated' });
    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).json({ error: 'Failed to update personal information' });
    }
})

router.put('/user/password', authToken, async(req, res) => {
    const user = req.user;
    const { oldPassword, newPassword, newPasswordConfirm } = req.body;
    // Walidacja danych
    if (!oldPassword || !newPassword || !newPasswordConfirm) {
        return res.status(400).json({ error: 'Missing old password, new password or new password confirmation' });
    }
    // Sprawdzenie poprawności starego hasła
    try {
        const hashedPassword = await db.oneOrNone('SELECT password FROM users WHERE id = $1', [user.id]);
        if (!hashedPassword || !(await comparePasswords(oldPassword, hashedPassword.password))) {
            return res.status(401).json({ error: 'Invalid old password' });
        }
    } catch (error) {
        console.error('Error fetching user password:', error);
        return res.status(500).json({ error: 'Failed to fetch user password' });
    }
    // Sprawdzenie poprawności nowego hasła
    if (newPassword !== newPasswordConfirm) {
        return res.status(400).json({ error: 'New password and confirmation do not match' });
    }
    // Hashowanie nowego hasła
    const hashedNewPassword = await hashPassword(newPassword);
    // Aktualizowanie hasła w bazie danych
    try {
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, user.id]);
        res.status(200).json({ message: 'Password updated' });
    } catch (error) {
        console.error('Error updating user password:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
})

// Wczytywanie rezerwacji
router.get('/reservations', authToken, async(req, res) => {
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
            const room = await db.oneOrNone('SELECT details FROM rooms WHERE id = $1', [reservation.room_id]);
            if (room) {
                reservation.room_name = room.details.name;
            } else {
                reservation.room_name = 'Nieznany pokój';
            }
            return reservation;
        }));

        res.status(200).json(reservationsWithRoomDetails); // Zwracamy rezerwacje z danymi pokoju
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// Tworzenie rezerwacji
router.post('/reservations/create', authToken, async(req, res) => {
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

        // Tworzenie rezerwacji
        await db.query(
            `INSERT INTO reservations (user_id, room_id, start_time, end_time, status, notes, created_at) 
            VALUES ($1, $2, $3, $4, 'pending', $5, NOW())`, [userId, roomId, start, end, notes]
        );

        // Wyślij potwierdzenie e-mail
        const userEmail = req.user.email;
        const roomDetails = await db.one('SELECT details->>\'name\' AS name FROM rooms WHERE id = $1', [roomId]);

        await sendConfirmationEmail(userEmail, roomDetails.name, start, end);

        res.status(200).json({ message: 'Rezerwacja została utworzona.' });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Nie udało się utworzyć rezerwacji.' });
    }
});

// Usuwanie rezerwacji
router.delete('/reservations/:id', authToken, async(req, res) => {
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

// Wyświetlanie pokoi pasujących do zakresu danych
router.get('/rooms/get', authToken, async(req, res) => {
    try {
        const { start_time, end_time, min_capacity = 1, min_price = 1, max_price = 100000 } = req.query;

        if (!start_time || !end_time) {
            return res.status(400).json({ error: 'Brak wymaganych parametrów: start_time i end_time' });
        }

        const query = `
            SELECT 
                r.id AS room_id,
                r.capacity,
                r.price_per_1h,
                r.details->>'name' AS name,
                r.details->>'location' AS location,
                r.details->>'description' AS description,
                r.details->'images' AS images
            FROM 
                rooms r
            LEFT OUTER JOIN 
                reservations res ON r.id = res.room_id 
                AND (
                    res.start_time < $2::timestamp
                    AND res.end_time > $1::timestamp
                )
            WHERE 
                r.capacity >= $3
                AND r.price_per_1h::numeric >= $4
                AND r.price_per_1h::numeric <= $5
                AND res.id IS NULL
            ORDER BY 
                r.price_per_1h::numeric ASC;
        `;

        const values = [start_time, end_time, min_capacity, min_price, max_price];

        const result = await db.query(query, values);

        const rooms = result.map((room) => ({
            id: room.room_id,
            capacity: room.capacity,
            pricePer1h: room.price_per_1h,
            name: room.name,
            location: room.location,
            description: room.description,
            images: room.images
        }));

        res.status(200).json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// Wyświetlanie szczegółów pokoju/sali
router.get('/rooms/:id', authToken, async(req, res) => {
    id = req.params.id;
    try {
        // Pobieranie szczegółów pokoju z bazy danych
        const room = await db.oneOrNone('SELECT * FROM rooms WHERE id = $1', [id]);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        const roomDetails = {
            id: room.id,
            capacity: room.capacity,
            pricePer1h: room.price_per_1h,
            ...room.details,
        };

        res.status(200).json(roomDetails);
    } catch (error) {
        console.error('Error fetching room details:', error);
        res.status(500).json({ error: 'Failed to fetch room details' });
    }
});


module.exports = {
    path: '/',
    router,
    routeName: 'protected'
};