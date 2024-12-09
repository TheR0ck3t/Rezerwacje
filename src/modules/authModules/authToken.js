const jwt = require('jsonwebtoken');
const path = require('path');

// Middleware for JWT verification
module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); // Dodaj to logowanie
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    console.log('Request URL:', req.originalUrl); // Dodaj to logowanie

    // Ignoruj zasoby statyczne
    const ext = path.extname(req.originalUrl);
    if (ext) {
        return next();
    }

    if (!token) {
        return res.redirect('/'); // Przekieruj na stronę logowania, jeśli token nie jest dostępny
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Error verifying token:', err.message);
            if (err.name === 'TokenExpiredError') {
                return res.redirect('/login'); // Przekieruj na stronę logowania, jeśli token wygasł
            }
            return res.redirect('/login'); // Przekieruj na stronę logowania, jeśli token jest nieprawidłowy
        }

        console.log('Verified User:', user); // Dodaj to logowanie
        req.user = user;
        next();
    });
}