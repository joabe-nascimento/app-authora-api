// backend/controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

// Converte jwt.sign para async/promise
const jwtSign = promisify(jwt.sign);

// Gera token JWT
const generateToken = async (userId) => {
  return await jwtSign({ user: { id: userId } }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const handleServerError = (res, error, contextMessage) => {
  console.error(`${contextMessage}:`, error.message);
  res.status(500).json({ message: "Erro no servidor" });
};

const validateUserExists = async (email, res) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: "Usuário já existe" });
    return true;
  }
  return false;
};

// ---------------------------------------------------
// CONTROLADORES
// ---------------------------------------------------

/**
 * @desc   Registra novo usuário
 */
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (await validateUserExists(email, res)) return;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Gera token
    const token = await generateToken(user.id);

    // Prepara user sem senha
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      createdAt: user.createdAt,
    };

    // Retorna { token, user }
    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    handleServerError(res, error, "Erro no registro de usuário");
  }
};

/**
 * @desc   Realiza login do usuário
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Gera token
    const token = await generateToken(user.id);

    // Monta objeto de usuário sem a senha
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      createdAt: user.createdAt,
    };

    // Retorna { token, user }
    return res.json({ token, user: userWithoutPassword });
  } catch (error) {
    handleServerError(res, error, "Erro no login de usuário");
  }
};

/**
 * @desc   Retorna dados do usuário logado (ex: se quiser usar /me)
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    return res.json(user);
  } catch (error) {
    handleServerError(res, error, "Erro ao buscar usuário");
  }
};

/**
 * @desc   Atualiza dados do usuário (nome, email, etc.)
 */
exports.updateUser = async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (email && email !== user.email) {
      if (await validateUserExists(email, res)) return;
      user.email = email;
    }
    if (name) user.name = name;

    const updatedUser = await user.save();
    const userWithoutPassword = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      createdAt: updatedUser.createdAt,
    };

    return res.json(userWithoutPassword);
  } catch (error) {
    handleServerError(res, error, "Erro ao atualizar usuário");
  }
};

/**
 * @desc   Altera a senha do usuário logado
 */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Senha atual incorreta" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ msg: "Senha atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao alterar a senha:", error.message);
    return res
      .status(500)
      .json({ msg: "Erro no servidor", error: error.message });
  }
};

/**
 * @desc   Atualiza a foto de perfil do usuário
 */
exports.updateProfilePhoto = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ msg: "Usuário não autenticado" });
    }
    if (!req.file) {
      return res.status(400).json({ msg: "Nenhum arquivo enviado" });
    }

    // Converte arquivo para Base64 (se for armazenar no DB)
    const base64Image = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { photo: base64Image },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    // Retorna usuário sem password
    const userWithoutPassword = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      createdAt: updatedUser.createdAt,
    };

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao atualizar foto do perfil:", error);
    return res
      .status(500)
      .json({ msg: "Erro interno do servidor", error: error.message });
  }
};

/**
 * @desc   Atualiza configurações do usuário (darkMode, language, etc.)
 */
exports.updateUserSettings = async (req, res) => {
  try {
    const {
      username,
      email,
      currentPassword,
      newPassword,
      darkMode,
      language,
      emailNotifications,
      pushNotifications,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Senha atual incorreta" });
      }

      if (newPassword) {
        if (newPassword.length < 6) {
          return res
            .status(400)
            .json({ msg: "A nova senha deve ter pelo menos 6 caracteres" });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }
    }

    if (username) user.name = username;
    if (email) user.email = email;

    // Ajuste para armazenar configurações
    user.settings = {
      darkMode,
      language,
      emailNotifications,
      pushNotifications,
    };

    await user.save();
    return res
      .status(200)
      .json({ msg: "Configurações atualizadas com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    return res.status(500).json({ msg: "Erro no servidor" });
  }
};
