const express = require('express');
const router = express.Router();
const path = require('path');
const authToken = require('../../modules/authModules/authToken');

router.get('/dashboard', authToken, (req, res) => {
    res.render(path.resolve(__dirname, '../../views/protected/dashboard.ejs'));
});

router.get('/user', authToken, (req, res) => {
    const user = req.user; // Assuming `authenticate` middleware validates JWT from cookies and attaches the user
    res.status(200).json({ message: `Welcome back, ${user.email}!` });
});

module.exports = {
    path: '/',
    router,
    routeName: 'protected'
};