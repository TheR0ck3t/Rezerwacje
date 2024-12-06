const bcrypt = require('bcrypt');

// Hash password
async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
}

// Compare passwords
async function comparePasswords(password, hashedPassword) {
    const result = await bcrypt.compare(password, hashedPassword);
    return result;
}

// Hash 2FA secret
async function hash2FA(secret) {
    const hashedSecret = await bcrypt.hash(secret, 10);
    return hashedSecret;
}

// Compare 2FA secret
async function compare2FA(secret, hashedSecret) {
    const result = await bcrypt.compare(secret, hashedSecret);
    return result;
}


module.exports = {
    hashPassword,
    comparePasswords,
    hash2FA,
    compare2FA,
};