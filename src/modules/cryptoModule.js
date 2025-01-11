const crypto = require('crypto-js'); // Import crypto-js

// Definiowanie algorytmu szyfrowania i klucza tajnego
const SECRET_KEY = process.env.ENCRYPTION_KEY; // Przechowywany w zmiennych środowiskowych
const IV_LENGTH = 16; // AES wymaga IV, zazwyczaj 16 bajtów dla AES

// Szyfrowanie wiadomości
function encrypt(text) {
    const iv = crypto.lib.WordArray.random(IV_LENGTH); // Generowanie losowego IV (16 bajtów)
    const encrypted = crypto.AES.encrypt(text, SECRET_KEY, { iv: iv }).toString(); // Szyfrowanie za pomocą AES
    return iv.toString(crypto.enc.Hex) + ':' + encrypted; // Zwracanie IV + zaszyfrowanego tekstu jako pojedynczy ciąg
}

// Deszyfrowanie wiadomości
function decrypt(text) {
    const textParts = text.split(':'); // Podział IV i zaszyfrowanej wiadomości
    const iv = crypto.enc.Hex.parse(textParts.shift()); // Parsowanie IV z formatu Hex
    const encryptedText = textParts.join(':'); // Pobieranie zaszyfrowanej wiadomości
    const decrypted = crypto.AES.decrypt(encryptedText, SECRET_KEY, { iv: iv }).toString(crypto.enc.Utf8); // Deszyfrowanie wiadomości
    return decrypted;
}

module.exports = { encrypt, decrypt };