const express = require('express');
const db = require('../../modules/dbModules/db');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../../services/mailing');

// Endpoint do obsługi żądania resetowania hasła
router.post('/password-recovery', async(req, res) => {
    const { email } = req.body;

    try {
        // Znajdź użytkownika w bazie danych
        const user = await db.oneOrNone('SELECT id FROM users WHERE email = $1', [email]);
        if (!user) {
            return res.status(404).json({ error: 'Użytkownik o podanym e-mailu nie istnieje' });
        }

        // Generowanie tokena JWT
        const resetToken = jwt.sign({ id: user.id },
            process.env.JWT_SECRET, { expiresIn: '1h' } // Token ważny przez 1 godzinę
        );

        // Wysyłanie e-maila resetującego hasło
        if (process.env.MAIL_ENABLED === 'true') {
            await sendPasswordResetEmail(email, resetToken);
        } else {
            console.log('Email service is disabled');
        }
        res.status(200).json({ message: 'E-mail resetujący został wysłany' });
    } catch (error) {
        console.error('Error handling password recovery:', error);
        res.status(500).json({ error: 'Nie udało się wysłać e-maila resetującego' });
    }
});


module.exports = {
    path: '/auth/',
    router,
    routeName: 'password-recovry'
};