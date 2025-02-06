require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

const userRoutes = require("./routes/userRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Permite todas as origens, mesmo quando 'credentials' está true.
app.use(
  cors({
    origin: (origin, callback) => {
      // Se não houver origem (ex.: requisições via Postman ou de mesmo domínio), permite.
      if (!origin) return callback(null, true);
      // Permite todas as origens
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// Rotas
app.use("/api/users", userRoutes);
app.use("/api/passwords", passwordRoutes);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Conectado ao MongoDB");
    // Se necessário, para que o serviço seja acessível externamente, você pode usar '0.0.0.0'
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
  });

module.exports = app;
