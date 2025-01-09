const express = require('express');
const db = require('../../modules/dbModules/db');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { hashPassword } = require('../../modules/authModules/userAuth');

// Endpoint do resetowania hasła
router.post('/reset-password', async(req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ error: 'Token and password are required' });
    }

    try {
        // Weryfikacja tokena
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Hashowanie nowego hasła
        const hashedPassword = await hashPassword(password);

        // Aktualizacja hasła w bazie danych
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

        res.status(200).json({ message: 'Password has been reset successfully!' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});


module.exports = {
    path: '/auth/',
    router,
    routeName: 'reset-password',
};