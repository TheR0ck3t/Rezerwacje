const express = require('express');
const router = express.Router();
const path = require('path');
const authToken = require('../../modules/authModules/authToken');

router.get('/dashboard', authToken, (req, res) => {
    res.render(path.resolve(__dirname, '../../views/protected/dashboard.ejs'), {
        currentPAge: 'dashboard',
        user: req.user.email || null
    });
});

router.get('/user', authToken, (req, res) => {
    const user = req.user; // Assuming `authToken` middleware validates JWT from cookies and attaches the user
    try {
        res.status(200).json({ message: `Welcome back, ${user.email}!` });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});


module.exports = {
    path: '/',
    router,
    routeName: 'protected'
};