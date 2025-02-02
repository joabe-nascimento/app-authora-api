// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUser } = require('../controllers/userController');
const { forgotPassword, resetPassword } = require('../controllers/passwordController'); // Importe os controllers para senha
const auth = require('../middleware/auth');

// Rota de Registro
router.post('/register', registerUser);

// Rota de Login
router.post('/login', loginUser);

// Rota para Obter Dados do Usuário (Protegida)
router.get('/me', auth, getUser);

// Rota para solicitação de redefinição de senha
router.post('/forgot-password', forgotPassword);

// Rota para redefinir a senha utilizando o token
router.post('/reset-password/:token', resetPassword);

module.exports = router;
