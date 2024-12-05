const chatService = require('../services/chatService.js');
const userSocketMap = new Map(); // Map to store userId -> socketId
let ioInstance = null;

module.exports = {
    setIO: (io) => {
        ioInstance = io;

        // Handle socket connections
        io.on('connection', (socket) => {
            console.log('Socket connection attempt'); // Log connection attempt
            const userId = socket.handshake.query.userId; // Expect userId passed in the handshake query
            console.log('Received userId:', userId); // Log received userId

            if (userId) {
                userSocketMap.set(userId, socket.id); // Map userId to socketId
                console.log(`User ${userId} connected with socket ${socket.id}`); // Log the socket ID of the connected user

                // Log current userSocketMap
                console.log('Current userSocketMap:', Array.from(userSocketMap.entries()));

                // Handle user disconnection
                socket.on('disconnect', () => {
                    userSocketMap.delete(userId); // Remove userId from the map
                    console.log(`User ${userId} disconnected`);

                    // Log current userSocketMap
                    console.log('Current userSocketMap:', Array.from(userSocketMap.entries()));
                });

                // Handle sending messages
                socket.on('sendMessage', async(data) => {
                    try {
                        const senderId = socket.decoded.id; // Get the sender's ID
                        const { message, receiverId } = data;

                        if (!receiverId) {
                            throw new Error('Receiver ID is required');
                        }

                        // Call your chat service to store the message
                        const sentMessage = await chatService.sendMessage(senderId, receiverId, message);
                        console.log('[sendMessage] Message stored successfully:', sentMessage);

                        // Emit acknowledgment to sender
                        socket.emit('messageSent', { success: true, message: sentMessage });

                        // Emit the message to the receiver if they're online
                        const receiverSocketId = userSocketMap.get(receiverId);
                        console.log('[sendMessage] Receiver socket ID:', receiverSocketId);

                        if (receiverSocketId) {
                            io.to(receiverSocketId).emit('newMessage', sentMessage); // Emit the message to the receiver
                        } else {
                            console.log(`[sendMessage] Receiver ${receiverId} is not connected.`);
                        }
                    } catch (error) {
                        console.error('[sendMessage] Error:', error.message);
                        socket.emit('messageSent', { success: false, error: error.message }); // Emit error to the sender
                    }
                });

                // Handle marking messages as read
                socket.on('markAsRead', async(data) => {
                    const { receiverId } = data;

                    if (!receiverId) return;

                    try {
                        const senderSocketId = userSocketMap.get(receiverId);
                        if (senderSocketId) {
                            io.to(senderSocketId).emit('messagesRead', { userId, receiverId });
                            console.log(`Messages marked as read for ${receiverId}`);
                        }
                    } catch (error) {
                        console.error('[markAsRead] Error:', error.message);
                    }
                })

            } else {
                console.warn('Socket connection missing userId');
            }
        });
    },

    getIO: () => {
        if (!ioInstance) {
            throw new Error('Socket.io instance not initialized');
        }
        return ioInstance;
    },

    getUserSocket: (userId) => {
        console.log('Getting socket ID for user:', userId); // Log the userId for which socket ID is being retrieved
        return userSocketMap.get(userId); // Get the socketId for the given userId
    },

    getAllMappedUsers: () => {
        return Array.from(userSocketMap.keys()); // Optional: Get all mapped userIds
    },
};