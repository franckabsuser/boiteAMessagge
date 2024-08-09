// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const WebSocket = require('ws');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;
const dbUri = process.env.MONGO_URI;

if (!dbUri) {
    console.error('La variable d\'environnement MONGO_URI n\'est pas définie.');
    process.exit(1);
}

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const { setWebSocketServer } = require('./socketService');
setWebSocketServer(wss);

const { userConnectionsObserver } = require('./socketService'); // Correction du chemin
userConnectionsObserver.addListener((action, userId) => {
    console.log(`UserConnectionsObserver: ${action} - ${userId}`);
});

mongoose.connect(dbUri)
    .then(() => console.log('MongoDB connecté'))
    .catch(err => {
        console.error('Erreur de connexion MongoDB:', err);
        process.exit(1);
    });

const userRoutes = require('./router/UserRoute');
const conversationRoutes = require('./router/ConversationRoutes');
const messageRoutes = require('./router/MessageRoutes');

app.use('/user', userRoutes);
app.use('/conv', conversationRoutes);
app.use('/messages', messageRoutes);

server.listen(PORT, () => {
    console.log(`Serveur HTTP et WebSocket en cours d'exécution sur le port ${PORT}`);
});

module.exports = { app, server, wss };
