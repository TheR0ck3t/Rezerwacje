const express = require('express');
const db = require('../../modules/dbModules/db');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.get('/verify-email', async(req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        await db.query('UPDATE users SET is_active = $1 WHERE id = $2', [true, userId]);
        console.log('Email verified successfully for user ' + userId)
            // Redirect to the login page here
        res.redirect('/auth?view=login');
    } catch (error) {
        console.error('Error verifying account:', error);
        return res.status(500).json({ error: 'Failed to verify account' });
    }
});

module.exports = {
    path: '/auth/',
    router,
    routeName: 'verify'
};