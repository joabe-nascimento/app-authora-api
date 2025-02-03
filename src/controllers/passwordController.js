// backend/controllers/passwordController.js
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

/**
 * Controller para solicitar a redefinição de senha.
 * Gera um token, salva-o no usuário com data de expiração e envia um e-mail com o link para redefinir a senha.
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email é obrigatório" });
  }

  try {
    // Verifica se o usuário existe com o e-mail fornecido
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Usuário não encontrado" });
    }

    // Gera um token único para a redefinição de senha
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Define a expiração do token (ex.: 1 hora a partir de agora)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

    await user.save();

    // Configuração do transportador do Nodemailer utilizando variáveis de ambiente
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // ex: 'smtp.gmail.com'
      port: process.env.SMTP_PORT, // ex: 587 ou 465
      secure: process.env.SMTP_SECURE === "true", // true se porta 465
      auth: {
        user: process.env.SMTP_USER, // seu e-mail
        pass: process.env.SMTP_PASS, // sua senha ou senha de app
      },
    });

    // Constrói a URL de redefinição utilizando a variável de ambiente FRONTEND_URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: user.email, // Envia para o e-mail cadastrado do usuário
      subject: "Redefinição de Senha",
      text: `Você solicitou a redefinição de senha. Clique no link abaixo para redefinir sua senha:\n\n${resetUrl}\n\nCaso não tenha solicitado, ignore este e-mail.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "E-mail de redefinição enviado com sucesso" });
  } catch (error) {
    console.error("Erro na solicitação de redefinição de senha:", error);
    res.status(500).json({ msg: "Erro interno do servidor ao enviar e-mail" });
  }
};

/**
 * Controller para redefinir a senha.
 * Verifica se o token é válido e não expirou, então atualiza a senha do usuário.
 */
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ msg: "Senha é obrigatória" });
  }

  try {
    console.log("Procurando usuário com token:", token);
    // Procura o usuário com o token e que ainda não expirou
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // token ainda é válido
    });

    if (!user) {
      console.log(
        "Nenhum usuário encontrado com token válido ou token expirado"
      );
      return res.status(400).json({ msg: "Token inválido ou expirado" });
    }

    // Criptografa a nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Atualiza a senha e remove o token e sua expiração
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ msg: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res
      .status(500)
      .json({ msg: "Erro interno do servidor ao redefinir senha" });
  }
};
