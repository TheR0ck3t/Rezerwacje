const nodemailer = require('nodemailer');

// Konfiguracja transportera nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE === 'true', // true dla portu 465, false dla innych portów
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

// Funkcja wysyłająca mail weryfikacyjny
async function sendVerificationEmail(email, token) {
    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Zweryfikuj swój adres email',
        html: `<p>Dziękujemy za rejestrację. Proszę zweryfikuj swój adres email, klikając w poniższy link:</p><p><a href="${verificationLink}">Zweryfikuj email</a></p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
}

// Funkcja wysyłająca mail resetowania hasła
async function sendPasswordResetEmail(email, token) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Zresetuj swoje hasło',
        html: `<p>Otrzymaliśmy prośbę o zresetowanie hasła. Jeśli to Ty, kliknij w poniższy link, aby zresetować hasło:</p>
               <p><a href="${resetLink}">Zresetuj hasło</a></p>
               <p>Jeśli to nie Ty, możesz zignorować tę wiadomość.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
}

// Funkcja wysyłająca mail potwierdzenia rezerwacji
async function sendReservationConfirmationEmail(email) {
    const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Potwierdzenie rezerwacji',
        html: `<p>Dziękujemy za dokonanie rezerwacji. Oczekuj na potwierdzenie.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Reservation confirmation email sent to:', email);
    } catch (error) {
        console.error('Error sending reservation confirmation email:', error);
        throw new Error('Failed to send reservation confirmation email');
    }
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendReservationConfirmationEmail,
};