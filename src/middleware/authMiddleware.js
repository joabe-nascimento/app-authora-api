const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Acesso negado. Nenhum token fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Acesso negado. Usuário não encontrado." });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({ message: "Token inválido." });
  }
};

module.exports = { verifyToken };