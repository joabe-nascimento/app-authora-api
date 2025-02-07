const express = require('express');
const router = express.Router();
const Password = require('../models/Password');
const { verifyToken } = require('../middleware/authMiddleware'); // Middleware para verificar o token JWT

// Obter todas as senhas do usuário autenticado
router.get('/', verifyToken, async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.user.id });
    res.json(passwords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Criar uma nova senha
router.post('/', verifyToken, async (req, res) => {
  const { service, username, password, category } = req.body;
  const newPassword = new Password({
    service,
    username,
    password,
    category,
    userId: req.user.id,
  });

  try {
    const savedPassword = await newPassword.save();
    res.status(201).json(savedPassword);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Atualizar uma senha
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const password = await Password.findOne({ _id: id, userId: req.user.id });

    if (!password) {
      return res.status(404).json({ message: 'Senha não encontrada' });
    }

    Object.assign(password, req.body);
    const updatedPassword = await password.save();
    res.json(updatedPassword);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Deletar uma senha
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = params;

  try {
    const password = await Password.findOne({ _id: id, userId: req.user.id });

    if (!password) {
      return res.status(404).json({ message: 'Senha não encontrada' });
    }

    await password.remove();
    res.json({ message: 'Senha removida com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;