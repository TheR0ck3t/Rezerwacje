const express = require('express');
const router = express.Router();
const path = require('path');
const authToken = require('../../modules/authModules/authToken');

router.get('/dashboard', authToken, (req, res) => {
    console.log('test');
    res.render(path.resolve(__dirname, '../../views/protected/dashboard.ejs'));
});

module.exports = {
    path: '/',
    router,
    routeName: 'protected'
};