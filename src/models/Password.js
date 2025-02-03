/**
 * File: backend/models/Password.js
 * Description: Modelo Mongoose para armazenamento de senhas relacionadas a serviços.
 */

const mongoose = require("mongoose");

const passwordSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: [true, "O campo 'service' é obrigatório."],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "O campo 'username' é obrigatório."],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "O campo 'password' é obrigatório."],
      trim: true,
    },
    category: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    // Gera automaticamente createdAt e updatedAt
    timestamps: true,
  }
);

module.exports = mongoose.model("Password", passwordSchema);
