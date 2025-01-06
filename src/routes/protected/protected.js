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
            return res.status(404).json({ error: 'User not found' });
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
        console.log(responseData);

        // Wysłanie danych użytkownika
        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.put('/user/info', authToken, async(req, res) => {
    const user = req.user; // Zakładamy, że middleware `authToken` dodaje dane użytkownika do `req.user`
    const { firstName, lastName, phoneNumber } = req.body;
    console.log('uwuwuwuwu', user.id)
    console.log(firstName, lastName, phoneNumber);
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
    const user = req.user; // Zakładamy, że middleware `authToken` dodaje dane użytkownika do `req.user`
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
    const user = req.user; // Zakładamy, że middleware `authToken` dodaje dane użytkownika do `req.user`
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

// Usuwanie rezerwacji
router.delete('/reservations/:id', authToken, async(req, res) => {
    const user = req.user; // Zakładamy, że middleware `authToken` dodaje dane użytkownika do `req.user`
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
    path: '/',
    router,
    routeName: 'protected'
};