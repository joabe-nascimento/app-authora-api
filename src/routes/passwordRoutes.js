const express = require("express");
const jwt = require("jsonwebtoken");
const Password = require("../models/Password");

const router = express.Router();

// Função para verificar se o token existe e é válido
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token inválido:", error);
    return res.status(401).json({ message: "Token inválido" });
  }
};

// Rota POST para criar uma senha
router.post("/", verifyToken, async (req, res) => {
  try {
    const newPassword = new Password({
      ...req.body,
      userId: req.user.id,
    });
    await newPassword.save();
    return res.status(201).json({ message: "Senha salva com sucesso", newPassword });
  } catch (error) {
    console.error("Erro ao salvar senha:", error);
    return res.status(500).json({ message: "Erro ao salvar a senha", error });
  }
});

// Rota PUT para atualizar uma senha
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedPassword = await Password.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedPassword) {
      return res.status(404).json({ message: "Senha não encontrada ou não autorizada" });
    }

    return res.status(200).json({ message: "Senha atualizada com sucesso", updatedPassword });
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return res.status(500).json({ message: "Erro ao atualizar a senha", error });
  }
});

// Rota DELETE para excluir uma senha
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedPassword = await Password.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedPassword) {
      return res.status(404).json({ message: "Senha não encontrada ou não autorizada" });
    }

    return res.status(200).json({ message: "Senha excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir senha:", error);
    return res.status(500).json({ message: "Erro ao excluir a senha", error });
  }
});

// Rota GET para listar todas as senhas do usuário
router.get("/", verifyToken, async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.user.id });
    return res.status(200).json(passwords);
  } catch (error) {
    console.error("Erro ao obter senhas:", error);
    return res.status(500).json({ message: "Erro ao obter senhas", error });
  }
});

module.exports = router;
