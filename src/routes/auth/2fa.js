const express = require('express');
const router = express.Router();
const db = require('../../modules/dbModules/db');
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');
const { TOTP, Secret } = require('otpauth');
const { encrypt, decrypt } = require('../../modules/cryptoModule');

// Generate 2FA secret and QR code
router.post('/generate', async(req, res) => {
    const { userId } = req.body;

    try {
        // Retrieve the user
        const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate 2FA secret
        const totp = new TOTP({
            issuer: 'Rezerwacje',
            label: `${user.email}`,
            algorithm: 'SHA256',
            digits: 6,
            period: 30,
        });
        const secret = totp.secret.base32;
        const otpauthURL = totp.toString();

        // Generate QR code
        const qrCodeUrl = await qrcode.toDataURL(otpauthURL);

        // Return the secret and QR code URL
        res.status(200).json({ secret, qrCodeUrl });
    } catch (error) {
        console.error('Error generating 2FA secret:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Enable 2FA
router.post('/enable', async(req, res) => {
    const { userId, token, secret } = req.body;

    try {
        // Retrieve the user
        const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify the token
        const totp = new TOTP({ secret: Secret.fromBase32(secret), algorithm: 'SHA256', digits: 6, period: 30 });
        const isValid = totp.validate({ token, window: 1 }) !== null;
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid 2FA token' });
        }

        // Encrypt the secret
        const encryptedSecret = encrypt(secret);

        // Update the user with the 2FA secret
        await db.none('UPDATE users SET two_factor_secret = $1 WHERE id = $2', [encryptedSecret, user.id]);

        res.status(200).json({ message: '2FA enabled' });
    } catch (error) {
        console.error('Error enabling 2FA:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Disable 2FA
router.post('/disable', async(req, res) => {
    const { userId } = req.body;

    try {
        // Retrieve the user
        const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the user with the 2FA secret
        await db.none('UPDATE users SET two_factor_secret = NULL WHERE id = $1', [user.id]);

        res.status(200).json({ message: '2FA disabled' });
    } catch (error) {
        console.error('Error disabling 2FA:', error);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
});

// Verify 2FA
router.post('/verify', async(req, res) => {
    const { userId, token } = req.body;
    console.log('Received request to verify 2FA token:', token, userId);
    console.log(`Verifying ${token} for user ${userId}`);

    try {
        // Retrieve the user
        const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        } else if (!user.two_factor_secret) {
            return res.status(400).json({ error: '2FA not enabled' });
        }

        // Decrypt the secret
        const decryptedSecret = decrypt(user.two_factor_secret);

        // Compare the token using compare2FA
        const totp = new TOTP({ secret: Secret.fromBase32(decryptedSecret), algorithm: 'SHA256', digits: 6, period: 30 });
        const isValid = totp.validate({ token, window: 1 }) !== null;
        console.log('2FA token is valid:', isValid);

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid 2FA token' });
        } else {
            const authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Set cookies for token and userId
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

// Check 2FA status
router.get('/status/:userId', async(req, res) => {
    const { userId } = req.params;

    try {
        // Retrieve the user
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