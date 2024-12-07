const path = require('path');
const express = require('express');
const router = express.Router();

// Static routes
router.get('/', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/public/index'));
});

router.get('/about', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/public/about'));
});

router.get('/loginForm', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/partials/forms/login.ejs'));
});

router.get('/registerForm', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/partials/forms/register.ejs'));
});

module.exports = {
    path: '/',
    router,
    routeName: 'public'
}