const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

async function sendVerificationEmail(email, token) {

    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Verify your email address',
        html: `<p>Thank you for registering. Please verify your email address by clicking the link below:</p><p><a href="${verificationLink}">Verify Email</a></p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
}
async function sendPasswordResetEmail(email, token) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Reset your password',
        html: `<p>We received a request to reset your password. If it was you, click the link below to reset your password:</p>
               <p><a href="${resetLink}">Reset Password</a></p>
               <p>If you did not request this, you can safely ignore this email.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
};