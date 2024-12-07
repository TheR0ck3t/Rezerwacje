require('dotenv').config({ path: './.env' });
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT;

// // Socket.io 
// const io = socketio(server);

// // Store the io instance globally
// const socketInstance = require('./modules/socketInstance');
// socketInstance.setIO(io);

// Config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// Dynamic route loading
const routesPath = path.join(__dirname, 'routes');
const loadRoutes = (dirPath) => {
    fs.readdirSync(dirPath).forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            loadRoutes(fullPath); // Rekurencja dla podfolderów
        } else {
            const { path: routePath, router, routeName } = require(fullPath);
            if (routePath && router) {
                app.use(routePath, router);
                console.log(`Loaded route: ${routeName} path: ${routePath}`);
            } else {
                console.error(`Invalid route export in: ${fullPath}`);
            }
        }
    });
};

loadRoutes(routesPath);

// Start server
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});