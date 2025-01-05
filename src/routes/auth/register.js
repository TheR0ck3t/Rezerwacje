const express = require('express');
const router = express.Router();
const db = require('../../modules/dbModules/db');
const jwt = require('jsonwebtoken');
const { hashPassword } = require('../../modules/authModules/userAuth');

router.post('/', async(req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    try {
        // Check if user with the given email already exists
        const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'User with given email already exists' });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Insert user into the database
        const newUser = await db.one('INSERT INTO users(email, password) VALUES($1, $2) RETURNING id', [email, hashedPassword]);
        console.log(newUser);

        // Generate JWT token
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set cookie for the user and update the session with the new token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1 hour
        });
        res.cookie('userId', newUser.id, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1 hour
        });
        await db.oneOrNone('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = $1', [email]);
        return res.status(200).json({ message: 'User registered successfully', newUser });


        // Send verification email


    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});


module.exports = {
    path: '/auth/register',
    router,
    routeName: 'register'
};