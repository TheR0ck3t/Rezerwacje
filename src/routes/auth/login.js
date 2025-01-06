const express = require('express');
const router = express.Router();
const db = require('../../modules/dbModules/db');
const jwt = require('jsonwebtoken');
const { comparePasswords } = require('../../modules/authModules/userAuth');

router.post('/', async(req, res) => {
    const { email, password, token2fa } = req.body;

    console.log('Received request to login with email:', email);

    // Validate email and password
    if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ error: 'Missing email or password' });
    }

    try {
        // Check if user exists and is active
        const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.is_active) {
            console.log('User is not active');
            return res.status(401).json({ error: 'User is not active' });
        }



        console.log('User found:', user);
        console.log(user.id);

        // Compare password
        const isMatch = await comparePasswords(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log('Password matched');

        // Check if 2FA is enabled
        if (user.two_factor_secret) {
            console.log('2FA is enabled');

            if (token2fa) {
                // Przekierowanie do trasy /verify
                return res.redirect(307, '/auth/2fa/verify');
            }

            // if 2FA is not provided, prompt for 2FA
            console.log('Prompting for 2FA');
            return res.status(200).json({
                requires2FA: true,
                userId: user.id,
            });
        }

        console.log('2FA is not enabled');

        // If 2FA is not required, generate JWT token and proceed
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set cookies for token and userId
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1 hour
        });
        res.cookie('userId', user.id.toString(), {
            httpOnly: false, // Set to false for frontend access
            secure: process.env.NODE_ENV === 'production', // Set to false for local dev
            maxAge: 3600000 // 1 hour
        });

        console.log('Cookies set for user:', user.id);

        // Update last login attempt
        try {
            await db.oneOrNone('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = $1', [email]);
            console.log('Last login updated for user:', email);
        } catch (err) {
            console.log('Error updating last login:', err);
        }

        return res.status(200).json({ message: 'Logged in successfully', userId: user.id });

    } catch (error) {
        console.error('Error during login process:', error);
        return res.status(500).json({ error: 'Failed to log in' });
    }
});

module.exports = {
    path: '/auth/login',
    router,
    routeName: 'login'
};