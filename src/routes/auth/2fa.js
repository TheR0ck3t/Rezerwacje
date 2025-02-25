const express = require('express');
const router = express.Router();
const db = require('../../modules/dbModules/db');
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');
const { TOTP, Secret } = require('otpauth');
const { encrypt, decrypt } = require('../../modules/cryptoModule');

// Generowanie sekretu 2FA i kodu QR
router.post('/generate', async(req, res) => {
    const { userId } = req.body;

    try {
        // Pobieranie użytkownika z bazy danych
        const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generowanie sekretu 2FA
        const totp = new TOTP({
            issuer: 'Rezerwacje',
            label: `${user.email}`,
            algorithm: 'SHA256',
            digits: 6,
            period: 30,
        });
        const secret = totp.secret.base32;
        const otpauthURL = totp.toString();

        // Generowanie kodu QR
        const qrCodeUrl = await qrcode.toDataURL(otpauthURL);

        // Zwracanie sekretu i URL kodu QR
        res.status(200).json({ secret, qrCodeUrl });
    } catch (error) {
        console.error('Error generating 2FA secret:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Włączanie 2FA
router.post('/enable', async(req, res) => {
    const { userId, token, secret } = req.body;
    console.log('Received request to enable 2FA for user:', userId);
    try {
        // Pobieranie użytkownika z bazy danych
        const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Weryfikacja tokena 2FA
        const totp = new TOTP({ secret: Secret.fromBase32(secret), algorithm: 'SHA256', digits: 6, period: 30 });
        const isValid = totp.validate({ token, window: 1 }) !== null;
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid 2FA token' });
        }

        // Szyfrowanie sekretu 2FA
        const encryptedSecret = encrypt(secret);

        // Aktualizacja użytkownika z zaszyfrowanym sekretem 2FA
        await db.none('UPDATE users SET two_factor_secret = $1 WHERE id = $2', [encryptedSecret, user.id]);

        res.status(200).json({ message: '2FA enabled' });
    } catch (error) {
        console.error('Error enabling 2FA:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Wyłączanie 2FA
router.post('/disable', async(req, res) => {
    const { userId } = req.body;
    console.log('Received request to disable 2FA for user:', userId);
    try {
        // Pobieranie użytkownika z bazy danych
        const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);
        console.log('User:', user);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Aktualizacja użytkownika, usunięcie sekretu 2FA
        await db.none('UPDATE users SET two_factor_secret = NULL WHERE id = $1', [user.id]);

        res.status(200).json({ message: '2FA disabled' });
    } catch (error) {
        console.error('Error disabling 2FA:', error);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
});

// Weryfikacja 2FA
router.post('/verify', async(req, res) => {
    const { userId, token } = req.body;
    console.log('Received request to verify 2FA token:', token, userId);
    console.log(`Verifying ${token} for user ${userId}`);

    try {
        // Pobieranie użytkownika z bazy danych
        const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        } else if (!user.two_factor_secret) {
            return res.status(400).json({ error: '2FA not enabled' });
        }

        // Deszyfrowanie sekretu 2FA
        const decryptedSecret = decrypt(user.two_factor_secret);

        // Weryfikacja tokena 2FA
        const totp = new TOTP({ secret: Secret.fromBase32(decryptedSecret), algorithm: 'SHA256', digits: 6, period: 30 });
        const isValid = totp.validate({ token, window: 1 }) !== null;
        console.log('2FA token is valid:', isValid);

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid 2FA token' });
        } else {
            // Generowanie tokena JWT
            const authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Ustawienie ciasteczek dla tokena i userId
            res.cookie('token', authToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000 // 1 hour
            });
            res.cookie('userId', user.id, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000 // 1 hour
            });

            console.log('Cookies set for user:', user.id);

            res.status(200).json({ message: '2FA token is valid', token: authToken });
        }
    } catch (error) {
        console.error('Error verifying 2FA:', error);
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
});

// Sprawdzanie statusu 2FA
router.get('/status/:userId', async(req, res) => {
    const { userId } = req.params;

    try {
        // Pobieranie użytkownika z bazy danych
        const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ enabled: !!user.two_factor_secret });
    } catch (error) {
        console.error('Error checking 2FA status:', error);
        res.status(500).json({ error: 'Failed to check 2FA status' });
    }
});

module.exports = {
    path: '/auth/2fa',
    router,
    routeName: '2fa'
};