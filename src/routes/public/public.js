const path = require('path');
const express = require('express');
const router = express.Router();

// Static routes
router.get('/', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/public/index'), {
        currentPage: 'home', // Przekazanie currentPage do widoku
        user: req.user || null // Dodanie user, jeśli jest zalogowany
    });
});

router.get('/about', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/public/about'), {
        currentPage: 'about',
        user: req.user || null
    });
});

router.get('/contact', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/public/contact.ejs'), {
        currentPage: 'contact',
        user: req.user || null
    });
});

router.get('/privacy-policy', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/public/privacy-policy.ejs'), {
        currentPage: 'privacy-policy',
        user: req.user || null
    });
});

router.get('/auth', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/public/auth.ejs'), {});
});

router.get('/loginForm', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/partials/forms/login.ejs'));
});

router.get('/registerForm', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/partials/forms/register.ejs'));
});

router.get('/twoFaModal', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/partials/modals/twoFaModal.ejs'));
});

module.exports = {
    path: '/',
    router,
    routeName: 'public'
}