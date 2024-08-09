// socketService.js
const WebSocket = require('ws');
const { userConnectionsObserver } = require('./userConnectionsProxy'); // Correction du chemin

let wss;

const setWebSocketServer = (websocketServer) => {
    if (!websocketServer || typeof websocketServer.clients === 'undefined') {
        throw new Error('Invalid WebSocket Server instance provided');
    }
    wss = websocketServer;
    wss.on('connection', handleConnection); // Attach connection handler
};

const handleConnection = (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);

            switch (parsedMessage.type) {
                case 'registerUser':
                    const { userId } = parsedMessage;
                    if (userId) {
                        userConnectionsObserver.set(userId, ws);
                        console.log(`User ${userId} registered`);
                        broadcastOnlineStatus(userId, true);
                    }
                    break;
                case 'sendMessage':
                    const { conversationId, ...messageData } = parsedMessage;
                    broadcast(conversationId, JSON.stringify({ type: 'receiveMessage', ...messageData }));
                    break;
                default:
                    console.log('Unknown message type:', parsedMessage.type);
            }
        } catch (error) {
            console.error('Message processing error:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        // Cleanup user connections
        for (const [userId, connection] of userConnectionsObserver.getAll()) {
            if (connection === ws) {
                userConnectionsObserver.delete(userId);
                console.log(`User ${userId} disconnected`);
                broadcastOnlineStatus(userId, false);
                break;
            }
        }
    });
};

const broadcast = (conversationId, message) => {
    if (!wss) {
        throw new Error('WebSocket Server instance is not defined');
    }

    if (typeof conversationId !== 'string') {
        throw new Error('Invalid argument: conversationId must be a string');
    }

    try {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client.conversationId === conversationId) {
                client.send(message);
            }
        });
    } catch (error) {
        console.error(`Failed to broadcast message to conversation '${conversationId}':`, error);
    }
};

const broadcastOnlineStatus = (userId, isOnline) => {
    // Notify other clients about this user's online status
    const message = JSON.stringify({
        type: 'userStatus',
        userId,
        isOnline
    });

    try {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    } catch (error) {
        console.error(`Failed to broadcast user status for '${userId}':`, error);
    }
};

module.exports = { setWebSocketServer, broadcast, userConnectionsObserver };
