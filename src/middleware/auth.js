// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Obter token do header
    const authHeader = req.header('Authorization');

    // Verificar se não há token
    if (!authHeader) {
        return res.status(401).json({ msg: 'Sem token, autorização negada' });
    }

    try {
        // Verificar token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token inválido' });
    }
};
