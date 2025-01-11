const jwt = require('jsonwebtoken');
const db = require('../../modules/dbModules/db');

module.exports = async(req, res, next) => {
    const token = req.cookies.token;

    // Sprawdzenie, czy token jest obecny
    if (!token) {
        return res.redirect('/errors/session-expired');
    }

    // Weryfikacja tokena JWT
    jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
        if (err) {
            console.error('Error verifying token:', err.message);
            const statusCode = err.name === 'TokenExpiredError' ? 401 : 403;
            return res.redirect('/session-expired');
        }
        try {
            // Pobranie użytkownika z bazy danych na podstawie decoded.userId
            const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [decoded.userId]);
            if (!user) {
                return res.redirect('/404');
            }
            req.user = user;
            next();
        } catch (error) {
            console.error('Error fetching user from database:', error);
            return res.redirect('/500');
        }
    });
};