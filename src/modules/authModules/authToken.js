const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Error verifying token:', err.message);
            return res.status(err.name === 'TokenExpiredError' ? 401 : 403).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};