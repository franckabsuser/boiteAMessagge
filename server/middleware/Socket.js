// socket.js
const socketIo = require('socket.io');

const setupSocketIO = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('Un utilisateur est connecté');

        // Exemple d'événement personnalisé
        socket.on('message', (msg) => {
            console.log('Message reçu:', msg);
            io.emit('message', msg); // Réémet le message à tous les clients connectés
        });

        // Événement de déconnexion
        socket.on('disconnect', () => {
            console.log('Utilisateur déconnecté');
        });
    });

    return io;
};

module.exports = { setupSocketIO };
