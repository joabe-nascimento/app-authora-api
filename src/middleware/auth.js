// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization; // Espera "Bearer <token>"
  if (!authHeader) {
    return res.status(401).json({ msg: "Sem token de autenticação" });
  }
  
  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({ msg: "Token mal formatado" });
  }
  
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ msg: "Token mal formatado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Verifica se o token possui o payload esperado, por exemplo: { user: { id: "..." } }
    if (!decoded || !decoded.user || !decoded.user.id) {
      return res.status(401).json({ msg: "Token inválido" });
    }
    req.user = decoded.user; // Define req.user com { id: "..." }
    next();
  } catch (err) {
    console.error("Erro na verificação do token:", err);
    return res.status(401).json({ msg: "Token expirado ou inválido" });
  }
};
