const express = require('express');
const router = express.Router();
const db = require('../../modules/dbModules/db');
const authToken = require('../../modules/authModules/authToken');
const { hashPassword, comparePasswords } = require('../../modules/authModules/userAuth');

router.get('/', authToken, async(req, res) => {
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

router.put('/info', authToken, async(req, res) => {
    const user = req.user;
    const { firstName, lastName, phoneNumber } = req.body;
    // Walidacja danych
    if (!firstName && !lastName && !phoneNumber) {
        return res.status(400).json({ error: 'At least one of first name, last name, or phone number is required' });
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

router.put('/password', authToken, async(req, res) => {
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


module.exports = {
    path: '/user',
    router,
    routeName: 'user',
};