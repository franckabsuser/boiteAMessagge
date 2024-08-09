const express = require('express');
const { User } = require('../models/User');
const { Conversation } = require('../models/ConversationModels');
const { authenticateToken } = require('../middleware/AuthToken');
const { emitMessage } = require('../socketService');

const router = express.Router();

// Route POST pour créer une conversation
router.post('/conversations', authenticateToken, async (req, res) => {
    const { participants } = req.body;

    if (!Array.isArray(participants) || participants.length === 0) {
        return res.status(400).json({ message: 'Participants are required and must be an array.' });
    }

    try {
        // Trouver les utilisateurs par leur adresse email
        const userDocs = await User.find({ email: { $in: participants } });

        // Vérifier si tous les participants sont trouvés
        if (userDocs.length !== participants.length) {
            return res.status(404).json({ message: 'One or more users not found' });
        }

        // Extraire les IDs des utilisateurs trouvés
        const userIds = userDocs.map(user => user._id);

        // Créer une nouvelle conversation
        const newConversation = new Conversation({
            participants: userIds,
            messages: [],
            lastMessage: null,
            isArchived: false
        });

        await newConversation.save();

        // Émettre l'événement de nouvelle conversation
        userIds.forEach(userId => {
            const userConnection = userConnections.get(userId);
            if (userConnection) {
                emitMessage(userConnection.conversationId, 'newConversation', newConversation);
            }
        });

        res.status(201).json(newConversation);
    } catch (err) {
        console.error('Error creating conversation:', err);
        res.status(500).json({ message: 'Server error creating conversation', error: err.message });
    }
});

// Route GET pour récupérer toutes les conversations d'un utilisateur
router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Trouver toutes les conversations pour l'utilisateur authentifié
        const conversations = await Conversation.find({ participants: userId })
            .populate({
                path: 'participants',
                select: 'nameAndFirstName email'
            })
            .exec();

        res.status(200).json(conversations);
    } catch (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).json({ message: 'Server error fetching conversations', error: err.message });
    }
});

// Route GET pour récupérer les détails d'une conversation spécifique
router.get('/conversations/:conversationId', authenticateToken, async (req, res) => {
    const { conversationId } = req.params;

    try {
        const userId = req.user.userId;

        // Trouver la conversation par son ID et vérifier que l'utilisateur fait partie des participants
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
        })
            .populate({
                path: 'participants',
                select: 'nameAndFirstName email'
            })
            .exec();

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found or you are not a participant' });
        }

        res.status(200).json(conversation);
    } catch (err) {
        console.error('Error fetching conversation details:', err);
        res.status(500).json({ message: 'Server error fetching conversation details', error: err.message });
    }
});

module.exports = router;
