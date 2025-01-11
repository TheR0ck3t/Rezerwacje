const express = require('express');
const router = express.Router();
const db = require('../../modules/dbModules/db');
const jwt = require('jsonwebtoken');
const { hashPassword } = require('../../modules/authModules/userAuth');
const { sendVerificationEmail } = require('../../services/mailing');

// Rejestracja nowego użytkownika
router.post('/', async(req, res) => {
    const { email, password } = req.body;

    // Walidacja danych wejściowych
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    try {
        // Sprawdzenie, czy użytkownik z podanym emailem już istnieje
        const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'User with given email already exists' });
        }

        // Hashowanie hasła
        const hashedPassword = await hashPassword(password);

        // Wstawienie nowego użytkownika do bazy danych
        const newUser = await db.one('INSERT INTO users(email, password, is_active) VALUES($1, $2, $3) RETURNING id', [email, hashedPassword, false]);
        console.log(newUser);

        // Generowanie tokena weryfikacyjnegon
        const verificationToken = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Wysyłanie maila weryfikacyjnego
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (err) {
            console.error('Error sending verification email:', err);
            return res.status(500).json({ error: 'Failed to send verification email' });
        }

        return res.status(200).json({ message: 'User registered successfully. Verification email sent.', newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Ponowne wysyłanie maila weryfikacyjnego
router.post('/resend-verification', async(req, res) => {
    const { email } = req.body;

    try {
        // Sprawdzenie, czy użytkownik istnieje i jest nieaktywny
        const user = await db.oneOrNone('SELECT id, is_active FROM users WHERE email = $1', [email]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.is_active) {
            return res.status(400).json({ error: 'User is already active' });
        }
        // Generowanie nowego tokena weryfikacyjnego
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await sendVerificationEmail(email, token);

        res.status(200).json({ message: 'Verification email resent successfully' });
    } catch (error) {
        console.error('Error resending verification email:', error);
        return res.status(500).json({ error: 'Failed to resend verification email' });
    }
});

module.exports = {
    path: '/auth/register',
    router,
    routeName: 'register'
};