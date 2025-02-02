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

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Encontra o usuário pelo ID fornecido pelo middleware de autenticação (req.user)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    // Verifica se a senha atual confere
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Senha atual incorreta" });
    }

    // Criptografa a nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Atualiza a senha do usuário
    user.password = hashedPassword;
    await user.save();

    res.json({ msg: "Senha atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao alterar a senha:", error.message);
    res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

// Solicitar mudança de email
exports.requestEmailChange = async (req, res) => {
  const { newEmail } = req.body;

  try {
    // Verifica se o novo email é diferente do atual
    if (newEmail === req.user.email) {
      return res
        .status(400)
        .json({ msg: "O novo email deve ser diferente do email atual." });
    }

    // Gera um token para a verificação
    const token = jwt.sign(
      { userId: req.user.id, newEmail },
      process.env.EMAIL_CHANGE_SECRET, // Defina essa variável no .env
      { expiresIn: "1h" }
    );

    // Cria o link de verificação (por exemplo, usando a URL do seu frontend)
    const verificationLink = `${process.env.FRONTEND_URL}/confirm-email-change?token=${token}`;

    // Envie o email para o novo endereço com o link de verificação
    // Exemplo usando uma função fictícia sendEmail:
    // await sendEmail(newEmail, "Confirmação de mudança de email", `Clique no link para confirmar sua mudança de email: ${verificationLink}`);
    console.log("Link de verificação:", verificationLink); // Para fins de debug

    res.json({
      msg: "Um email de verificação foi enviado para o novo endereço.",
    });
  } catch (error) {
    console.error("Erro ao solicitar mudança de email:", error.message);
    res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

// Confirmar mudança de email
exports.confirmEmailChange = async (req, res) => {
  const { token } = req.params;

  try {
    // Verifica o token usando a chave secreta definida
    const decoded = jwt.verify(token, process.env.EMAIL_CHANGE_SECRET);
    const { userId, newEmail } = decoded;

    // Encontra o usuário e atualiza o email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    user.email = newEmail;
    await user.save();

    res.json({ msg: "Email alterado com sucesso!" });
  } catch (error) {
    console.error("Erro na confirmação de email:", error.message);
    res.status(400).json({ msg: "Token inválido ou expirado." });
  }
};
exports.updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id; // Supõe que o middleware 'auth' define req.user
    if (!req.file) {
      return res.status(400).json({ msg: 'Nenhum arquivo enviado' });
    }

    // Constrói a URL da imagem (ajusta de acordo com sua configuração)
    const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Atualiza o usuário com a nova foto
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { photo: photoUrl },
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar foto do perfil:', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
};