const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/AuthToken'); // Notez le changement ici

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Route pour l'inscription
router.post('/register', async (req, res) => {
    const { email, nameAndFirstName, jeSuis, password } = req.body;

    if (!email || !nameAndFirstName || !jeSuis || !password) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            nameAndFirstName,
            jeSuis,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// Route pour la connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '365d' });

        res.status(200).json({ message: 'Connexion réussie.', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la connexion de l\'utilisateur.', error: err.message });
    }
});

// Route pour vérifier si l'utilisateur est connecté
router.get('/status', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Utilisateur connecté.', user: req.user });
});

// Route pour vérifier si l'utilisateur existe
router.get('/exists/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });
        res.status(200).json({ exists: !!user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// Route pour obtenir les détails d'un utilisateur par ID
router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('Erreur lors de la récupération des détails de l\'utilisateur :', err);
        res.status(500).json({ message: 'Erreur lors de la récupération des détails de l\'utilisateur.', error: err.message });
    }
});

module.exports = router;
