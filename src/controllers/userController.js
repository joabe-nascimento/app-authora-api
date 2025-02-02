const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const jwtSign = promisify(jwt.sign);

// Helpers
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

// Controladores
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

    const token = await generateToken(user.id);
    res.status(201).json({ token });
  } catch (error) {
    handleServerError(res, error, "Erro no registro de usuário");
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = await generateToken(user.id);
    res.json({ token });
  } catch (error) {
    handleServerError(res, error, "Erro no login de usuário");
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    user
      ? res.json(user)
      : res.status(404).json({ message: "Usuário não encontrado" });
  } catch (error) {
    handleServerError(res, error, "Erro ao buscar usuário");
  }
};

exports.updateUser = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado" });

    if (email && email !== user.email) {
      if (await validateUserExists(email, res)) return;
      user.email = email;
    }

    if (name) user.name = name;

    const updatedUser = await user.save();
    res.json(await User.findById(updatedUser.id).select("-password"));
  } catch (error) {
    handleServerError(res, error, "Erro ao atualizar usuário");
  }
};
