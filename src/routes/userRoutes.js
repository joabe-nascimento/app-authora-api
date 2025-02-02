// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  getUser, 
  updateUser, 
  changePassword,
  updateProfilePhoto,  // Importa a nova função
} = require('../controllers/userController');

const { forgotPassword, resetPassword } = require('../controllers/passwordController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // Importa o multer

// Rota de Registro
router.post('/register', registerUser);

// Rota de Login
router.post('/login', loginUser);

// Rota para Obter Dados do Usuário (Protegida)
router.get('/me', auth, getUser);

// Rota para Atualizar Dados do Usuário (Protegida)
router.put('/me', auth, updateUser);

// Rota para Alterar Senha (Protegida)
router.put('/change-password', auth, changePassword);

// Rotas para redefinição de senha
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// **Nova rota para atualizar a foto do perfil**
router.put('/me/photo', auth, upload.single('photo'), updateProfilePhoto);

module.exports = router;
