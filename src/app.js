// backend/app.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // URL do front-end
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Rota para servir arquivos estáticos da pasta 'uploads'
app.use("/uploads", express.static("uploads"));

// Rotas
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Conexão com o MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conectado ao MongoDB");
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao MongoDB:", error);
  });
