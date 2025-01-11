const express = require('express');
const db = require('../../modules/dbModules/db');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Endpoint do weryfikacji emaila
router.get('/verify-email', async(req, res) => {
    const { token } = req.query;

    try {
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }
        // Weryfikacja tokena i pobieranie ID użytkownika
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        // Aktywacja konta użytkownika
        await db.query('UPDATE users SET is_active = $1 WHERE id = $2', [true, userId]);
        console.log('Email verified successfully for user ' + userId);
        // Przekierowanie do strony logowania
        res.redirect('/auth?view=login');
    } catch (error) {
        console.error('Error verifying account:', error);
        return res.status(500).json({ error: 'Failed to verify account' });
    }
});

module.exports = {
    path: '/auth/',
    router,
    routeName: 'verify email'
};