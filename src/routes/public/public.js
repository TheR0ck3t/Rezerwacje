const path = require('path');
const express = require('express');
const fs = require('fs');
const router = express.Router();

// Dynamic route creation based on files in views/public
const viewsPath = path.resolve(__dirname, '../../views/public');
fs.readdirSync(viewsPath).forEach(file => {
    if (file.endsWith('.ejs')) {
        const routeName = file.split('.')[0];
        const routePath = routeName === 'index' ? '/' : `/${routeName}`;
        router.get(routePath, (req, res) => {
            res.render(path.join(viewsPath, file), {
                user: req.user || null,
                currentPage: routeName,
            });
        });
        console.log('Loaded route: ' + routeName + ' path:' + routePath);
    }
});

router.get('/twoFaModal', (req, res) => {
    res.render(path.resolve(__dirname, '../../views/partials/modals/twoFaModal.ejs'));
});

module.exports = {
    path: '/',
    router,
    routeName: 'public'
}