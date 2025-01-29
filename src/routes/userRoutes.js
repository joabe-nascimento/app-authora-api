// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUser } = require('../controllers/userController');
const auth = require('../middleware/auth');

// Rota de Registro
router.post('/register', registerUser);

// Rota de Login
router.post('/login', loginUser);

// Rota para Obter Dados do Usuário (Protegida)
router.get('/me', auth, getUser);

module.exports = router;
