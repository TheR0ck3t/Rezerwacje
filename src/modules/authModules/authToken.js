const jwt = require('jsonwebtoken');
const db = require('../../modules/dbModules/db');

module.exports = async(req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
        if (err) {
            console.error('Error verifying token:', err.message);
            return res.status(err.name === 'TokenExpiredError' ? 401 : 403).json({ message: 'Invalid token' });
        }

        try {
            const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [decoded.id]);
            console.log(user);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            req.user = user;
            next();
        } catch (error) {
            console.error('Error fetching user from database:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
};