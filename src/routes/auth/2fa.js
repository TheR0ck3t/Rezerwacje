const express = require('express');
const router = express.Router();
const db = require('../../modules/dbModules/db');
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');
const { TOTP } = require('otpauth');
const { hash2FA, compare2FA } = require('../../modules/authModules/userAuth');

// Enable 2fa
router.post('/enable', async(req, res) => {
    const { userId } = req.body;

    try {
        // Retrieve the user
        const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

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
        const secret = totp.secret();
        const otpauthURL = totp.toString();

        // Hash the secret
        const hashedSecret = await hash2FA(secret);

        // Update the user with the 2FA secret
        await db.none('UPDATE users SET two_factor_secret = $1 WHERE id = $2', [hashedSecret, userId]);

        // Generate QR code
        const qrCodeUrl = await qrcode.toDataURL(otpauthURL);

        res.status(200).json({ qrCodeUrl });
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
        await db.none('UPDATE users SET two_factor_secret = NULL WHERE id = $1', [userId]);

        res.status(200).json({ message: '2FA disabled' });
    } catch (error) {
        console.error('Error disabling 2FA:', error);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
});

// Verify 2FA
router.post('/verify', async(req, res) => {
    const { userId, token } = req.body;

    try {
        // Retrieve the user
        const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        } else if (!user.two_factor_secret) {
            return res.status(400).json({ error: '2FA not enabled' });
        }

        // Compare the token
        const totp = new TOTP({ secret: user.two_fa_secret, algorithm: 'SHA256', digits: 6, period: 30 });
        const isValid = totp.verify({ token, window: 1 }) !== null;

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid 2FA token' });
        } else {
            const authToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: '2FA token is valid', token: authToken });
        }
    } catch (error) {
        console.error('Error verifying 2FA:', error);
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
});

//Check 2fa status
router.post('/status/:userId', async(req, res) => {
    const { userId } = req.params;

    try {
        // Retrieve the user
        const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

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
}