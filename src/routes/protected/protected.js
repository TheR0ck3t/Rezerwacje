const express = require('express');
const router = express.Router();
const path = require('path');
const authToken = require('../../modules/authModules/authToken');

router.get('/dashboard', authToken, (req, res) => {
    res.render(path.resolve(__dirname, '../../views/protected/dashboard'));
});

module.exports = {
    path: '/',
    router,
    routeName: 'protected'
};