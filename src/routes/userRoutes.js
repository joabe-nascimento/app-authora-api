// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  changePassword,
  updateProfilePhoto, // Controller para atualizar a foto do perfil
} = require("../controllers/userController");

const {
  forgotPassword,
  resetPassword,
} = require("../controllers/passwordController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { updateUserSettings } = require("../controllers/userController");

// Rota de registro
router.post("/register", registerUser);

// Rota de login
router.post("/login", loginUser);

// Rota para obter dados do usuário (protege com auth)
router.get("/me", auth, getUser);

// Rota para atualizar dados do usuário
router.put("/me", auth, updateUser);

// Rota para alterar a senha
router.put("/change-password", auth, changePassword);
router.post("/update-settings", auth, updateUserSettings);

// Rotas para redefinição de senha
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Rota para atualizar a foto do perfil
router.put("/me/photo", auth, upload.single("photo"), updateProfilePhoto);

module.exports = router;
