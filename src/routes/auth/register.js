const express = require('express');
const router = express.Router();
const db = require('../../modules/dbModules/db');
const jwt = require('jsonwebtoken');
const { hashPassword } = require('../../modules/authModules/userAuth');
const { sendVerificationEmail } = require('../../services/mailing');

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
        const newUser = await db.one('INSERT INTO users(email, password, is_active) VALUES($1, $2, $3) RETURNING id', [email, hashedPassword, false]);
        console.log(newUser);

        // Generate verification token
        const verificationToken = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (err) {
            console.error('Error sending verification email:', err);
            return res.status(500).json({ error: 'Failed to send verification email' });
        }

        return res.status(200).json({ message: 'User registered successfully. Verification email sent.', newUser });
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