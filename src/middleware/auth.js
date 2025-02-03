/**
 * File: backend/middleware/auth.js
 * Description: Middleware para autenticação via JWT.
 */

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Verifica se existe header de autorização
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ msg: "Acesso negado. Nenhum token fornecido." });
    }

    // Divide em "Bearer" e "<token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
      return res.status(401).json({ msg: "Token mal formatado" });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ msg: "Token mal formatado" });
    }

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifica se no payload do token existe o campo "user.id"
    if (!decoded || !decoded.user || !decoded.user.id) {
      return res.status(401).json({ msg: "Token inválido" });
    }

    // Define req.user para uso posterior nos controllers
    req.user = decoded.user;  

    return next();
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    return res.status(401).json({ msg: "Token expirado ou inválido" });
  }
};
