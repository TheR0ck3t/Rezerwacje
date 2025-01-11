const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const authToken = require('../../modules/authModules/authToken');

// Middleware ustawiający zmienne lokalne dla chronionych tras
router.use((req, res, next) => {
    res.locals.isProtected = true; // Ustawia zmienną lokalną informującą, że trasa jest chroniona
    const pathParts = req.path.split('/');
    res.locals.currentPage = pathParts[1] || ''; // Ustawia zmienną lokalną z nazwą bieżącej strony
    next();
});

// Dynamiczne tworzenie tras na podstawie plików w views/protected
const viewsPath = path.resolve(__dirname, '../../views/protected');
fs.readdirSync(viewsPath).forEach(file => {
    if (file.endsWith('.ejs')) {
        const routeName = file.split('.')[0];
        router.get(`/${routeName}`, authToken, (req, res) => {
            res.render(path.join(viewsPath, file), {
                user: req.user.email || null, // Przekazuje email użytkownika do widoku
                currentPage: routeName, // Przekazuje nazwę bieżącej strony do widoku
            });
        });
        console.log(`Loaded route: ${routeName}\nPath: /${routeName}\nFrom file: ${path.relative(viewsPath, path.join(viewsPath, file))}\n`);
    }
});




module.exports = {
    path: '/',
    router,
    routeName: 'protected'
};