const express = require('express');
const router = express.Router();
const { Message } = require('../models/MessageModels');
const { authenticateToken } = require('../middleware/AuthToken');
const { emitMessage, userConnections } = require('../socketService');

// Fonction utilitaire pour valider les champs requis
const validateMessageFields = (fields) => {
    const requiredFields = ['sender', 'receiver', 'content', 'conversationId'];
    const missingFields = requiredFields.filter(field => !fields[field]);

    if (missingFields.length > 0) {
        return `Les champs suivants sont manquants: ${missingFields.join(', ')}`;
    }
    return null;
};

// Route pour envoyer un message texte
router.post('/text', authenticateToken, async (req, res) => {
    try {
        const { sender, receiver, content, conversationId } = req.body;

        if (!sender || !receiver || !content || !conversationId) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const error = validateMessageFields({ sender, receiver, content, conversationId });

        if (error) {
            return res.status(400).json({ error });
        }

        const message = new Message({
            sender,
            receiver,
            messageType: 'text',
            content,
            conversationId
        });

        await message.save();
        if (conversationId) {
            emitMessage(conversationId, 'receiveMessage', message);
        } else {
            console.error('Erreur : conversationId est undefined');
        }
        res.status(201).json(message);
    } catch (err) {
        console.error('Erreur lors de la sauvegarde du message:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour envoyer un message URL
router.post('/url', authenticateToken, async (req, res) => {
    try {
        const { sender, receiver, content, conversationId } = req.body;
        const error = validateMessageFields({ sender, receiver, content, conversationId });

        if (error) {
            return res.status(400).json({ error });
        }

        const message = new Message({
            sender,
            receiver,
            messageType: 'url',
            content,
            conversationId
        });

        await message.save();
        emitMessage(conversationId, 'receiveMessage', message);
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour envoyer un message avec un fichier
router.post('/file', authenticateToken, async (req, res) => {
    try {
        const { sender, receiver, content, conversationId } = req.body;
        const error = validateMessageFields({ sender, receiver, content, conversationId });

        if (error) {
            return res.status(400).json({ error });
        }

        const message = new Message({
            sender,
            receiver,
            messageType: 'file',
            content,
            conversationId
        });

        await message.save();
        emitMessage(conversationId, 'receiveMessage', message);
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour envoyer un message avec une image
router.post('/image', authenticateToken, async (req, res) => {
    try {
        const { sender, receiver, content, conversationId } = req.body;
        const error = validateMessageFields({ sender, receiver, content, conversationId });

        if (error) {
            return res.status(400).json({ error });
        }

        const message = new Message({
            sender,
            receiver,
            messageType: 'image',
            content,
            conversationId
        });

        await message.save();
        emitMessage(conversationId, 'receiveMessage', message);
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour obtenir tous les messages d'une conversation
router.get('/:conversationId', authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId }).populate('sender receiver');
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour ajouter une réaction à un message
router.post('/:messageId/reactions', authenticateToken, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { user, reactionType } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message non trouvé' });
        }

        message.reactions.push({ user, reactionType });
        await message.save();
        emitMessage(message.conversationId, 'updateReactions', message);
        res.status(200).json(message);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour supprimer une réaction d'un message
router.delete('/:messageId/reactions/:reactionId', authenticateToken, async (req, res) => {
    try {
        const { messageId, reactionId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message non trouvé' });
        }

        message.reactions.id(reactionId).remove();
        await message.save();
        emitMessage(message.conversationId, 'updateReactions', message);
        res.status(200).json(message);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour modifier une réaction d'un message
router.put('/:messageId/reactions/:reactionId', authenticateToken, async (req, res) => {
    try {
        const { messageId, reactionId } = req.params;
        const { reactionType } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message non trouvé' });
        }

        const reaction = message.reactions.id(reactionId);
        if (!reaction) {
            return res.status(404).json({ error: 'Réaction non trouvée' });
        }

        reaction.reactionType = reactionType;
        await message.save();
        emitMessage(message.conversationId, 'updateReactions', message);
        res.status(200).json(message);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour répondre à un message
router.post('/:messageId/reply', authenticateToken, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { sender, receiver, content, conversationId } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message non trouvé' });
        }

        const reply = new Message({
            sender,
            receiver,
            content,
            replyTo: messageId,
            conversationId,
            messageType: 'text'
        });

        await reply.save();
        emitMessage(conversationId, 'receiveMessage', reply);
        res.status(201).json(reply);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour vérifier si un message a été lu
router.put('/:messageId/read-status', authenticateToken, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { isRead } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message non trouvé' });
        }

        message.isRead = isRead;
        await message.save();
        emitMessage(message.conversationId, 'updateMessageStatus', message);
        res.status(200).json(message);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour obtenir les messages non lus d'une conversation
router.get('/:conversationId/unread', authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId, isRead: false }).populate('sender receiver');
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
