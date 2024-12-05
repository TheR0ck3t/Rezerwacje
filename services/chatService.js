// chatService.js - Handles the core functionality for sending and receiving messages
const db = require('../modules/dbModules/db.js'); // Database module
const cryptoModule = require('../modules/cryptoModule.js'); // Assuming you have a module for message encryption

// Function to fetch messages between users
const getMessages = async(userId, receiverId) => {
    if (!userId || !receiverId) {
        throw new Error('User ID and Receiver ID are required');
    }

    try {
        const query = `
            SELECT id, sender_id, receiver_id, message, timestamp
            FROM messages
            WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY timestamp DESC;
        `;
        const values = [userId, receiverId];

        const result = await db.any(query, values); // Fetch messages from DB

        if (!result || result.length === 0) {
            return [];
        }

        // Decrypt messages
        const decryptedMessages = result.map((message) => ({
            ...message,
            message: cryptoModule.decrypt(message.message), // Decrypt the message
        }));

        return decryptedMessages;
    } catch (error) {
        console.error('[getMessages] Error:', error.message);
        throw new Error('Failed to fetch messages');
    }
};

// Function to send a new message
const sendMessage = async(senderId, receiverId, message) => {
    if (!senderId || !receiverId || !message) {
        throw new Error('Sender ID, Receiver ID, and message are required');
    }

    try {
        const encryptedMessage = cryptoModule.encrypt(message); // Encrypt the message

        const query = `
            INSERT INTO messages (sender_id, receiver_id, message, timestamp)
            VALUES ($1, $2, $3, NOW()) RETURNING id, sender_id, receiver_id, message, timestamp;
        `;
        const values = [senderId, receiverId, encryptedMessage];

        // Store message and fetch the inserted record
        const result = await db.one(query, values);

        return {
            id: result.id,
            sender_id: result.sender_id,
            receiver_id: result.receiver_id,
            message: cryptoModule.decrypt(result.message), // Decrypt the message for the frontend
            timestamp: result.timestamp,
        };
    } catch (error) {
        console.error('[sendMessage] Error:', error.message);
        throw new Error('Failed to send message');
    }
};

// Function to get a list of users for the chat
const getUsers = async() => {
    try {
        const query = `
            SELECT id, username
            FROM users;
        `;
        const users = await db.any(query); // Fetch all users

        return users;
    } catch (error) {
        console.error('Error fetching users:', error.message);
        throw error;
    }
};

// Function to mark a message as read
const markAsRead = async(receiverId, senderId) => {
    if (!receiverId || !senderId) {
        throw new Error('Receiver ID and Sender ID are required');
    }
    try {
        const query = `
        UPDATE messages
        SET read_at = NOW()
        WHERE receiver_id = $1 AND sender_id = $2 AND read_at IS NULL;
    `;
        const values = [receiverId, senderId];

        await db.none(query, values); // Mark messages as read
    } catch (error) {
        console.error('[markAsRead] Error:', error.message);
        throw new Error('Failed to mark messages as read');
    }
};

module.exports = {
    getMessages,
    sendMessage,
    getUsers,
    markAsRead
};