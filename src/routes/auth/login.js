const express = require('express');
const router = express.Router();
const db = require('../../modules/dbModules/db');
const jwt = require('jsonwebtoken');
const { comparePassword, compareEmail } = require('../../modules/authModules/userAuth');
const { TOTP } = require('otpauth');

// Login 

router.post('/', async(req, res) => {
    const { email, password, token2fa } = req.body;

    // Validate email and password
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }
    try {

        // Check if user exists
        const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }


        // Compare password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if 2FA is enabled
        if (user.two_factor_secret) {
            if (token2fa) {
                // Create TOTP instance with user's secret
                const totp = new TOTP({
                    secret: user.two_factor_secret,
                    algorithm: 'SHA256',
                    digits: 6,
                    period: 30,
                });

                // Validate token
                const isValid = totp.validate({
                    token: token2fa,
                    window: 1,
                }) !== null;

                if (!isValid) {
                    return res.status(401).json({ error: 'Invalid 2FA token' });
                }

                // Generate JWT
                const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

                return res.status(200).json({ message: 'Logged in successfully', token, userId: user.id });
            }


            // if 2FA is not provided prompt for 2FA
            return res.status(200).json({
                requires2FA: true,
                userId: user.id,
            })

        }
        // If 2fa is not required, generate JWT token and proceed
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return userId and token to frontend
        res.status(200).json({ message: 'Logged in successfully', token, userId: user.id });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Failed to log in' });
    }
})

module.exports = {
    path: '/auth/login',
    router,
    routeName: 'login'
};