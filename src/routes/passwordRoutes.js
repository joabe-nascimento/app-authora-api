const express = require("express");
const router = express.Router();
const Password = require("../models/Password");

/**
 * @desc  Cria uma nova senha
 * @route POST /api/passwords
 */
router.post("/", async (req, res) => {
  try {
    const newPassword = new Password(req.body);
    await newPassword.save();
    return res
      .status(201)
      .json({ message: "Senha salva com sucesso", newPassword });
  } catch (error) {
    console.error("Erro ao salvar senha:", error);
    return res.status(500).json({ message: "Erro ao salvar a senha", error });
  }
});

/**
 * @desc  Atualiza uma senha existente
 * @route PUT /api/passwords/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedPassword = await Password.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedPassword) {
      return res.status(404).json({ message: "Senha não encontrada" });
    }

    return res
      .status(200)
      .json({ message: "Senha atualizada com sucesso", updatedPassword });
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return res
      .status(500)
      .json({ message: "Erro ao atualizar a senha", error });
  }
});

/**
 * @desc  Exclui uma senha
 * @route DELETE /api/passwords/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedPassword = await Password.findByIdAndDelete(req.params.id);

    if (!deletedPassword) {
      return res.status(404).json({ message: "Senha não encontrada" });
    }

    return res.status(200).json({ message: "Senha excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir senha:", error);
    return res.status(500).json({ message: "Erro ao excluir a senha", error });
  }
});

/**
 * @desc  Retorna todas as senhas
 * @route GET /api/passwords
 */
router.get("/", async (req, res) => {
  try {
    // const passwords = await Password.find();
    const passwords = await Password.find({ user_id: userId }); // Retorna só as senhas desse usuário
    return res.status(200).json(passwords);
  } catch (error) {
    console.error("Erro ao obter senhas:", error);
    return res.status(500).json({ message: "Erro ao obter senhas", error });
  }
});

// Retorna apenas as senhas do usuário autenticado
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Pegando o ID do usuário autenticado
    const passwords = await Password.find({ userId }); // Filtrando apenas as senhas desse usuário

    return res.status(200).json(passwords);
  } catch (error) {
    console.error("Erro ao obter senhas:", error);
    return res.status(500).json({ message: "Erro ao obter senhas", error });
  }
});

module.exports = router;
