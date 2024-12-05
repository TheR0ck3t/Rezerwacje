const crypto = require('crypto-js'); // Import crypto-js

// Define your encryption algorithm and secret key
const ALGORITHM = 'AES'; // 'aes-256-cbc' is not directly supported in crypto-js, use 'AES'
const SECRET_KEY = process.env.ENCRYPTION_KEY; // Store in environment variables
const IV_LENGTH = 16; // AES requires an IV, typically 16 bytes for AES

// Encrypt a message
function encrypt(text) {
    const iv = crypto.lib.WordArray.random(IV_LENGTH); // Generate a random IV (16 bytes)
    const encrypted = crypto.AES.encrypt(text, SECRET_KEY, { iv: iv }).toString(); // Encrypt with AES
    return iv.toString(crypto.enc.Hex) + ':' + encrypted; // Return IV + encrypted text as a single string
}

// Decrypt a message
function decrypt(text) {
    const textParts = text.split(':'); // Split IV and encrypted message
    const iv = crypto.enc.Hex.parse(textParts.shift()); // Parse IV from Hex
    const encryptedText = textParts.join(':'); // Get the encrypted message
    const decrypted = crypto.AES.decrypt(encryptedText, SECRET_KEY, { iv: iv }).toString(crypto.enc.Utf8); // Decrypt the message
    return decrypted;
}

module.exports = { encrypt, decrypt };