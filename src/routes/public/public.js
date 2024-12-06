const path = require('path');
const express = require('express');
const router = express.Router();

// Static routes
router.get('/', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/pages/index'));
});

router.get('/about', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/pages/about'));
});


module.exports = {
    path: '/',
    router
}