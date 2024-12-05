const path = require('path');
const express = require('express');
const router = express.Router();

// Static routes
router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
});


module.exports = {
    path: '/public/public',
    router
}