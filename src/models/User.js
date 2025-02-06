/**
 * File: backend/models/User.js
 * Description: Modelo Mongoose para armazenamento de dados de usuários.
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "O campo 'name' é obrigatório."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "O campo 'email' é obrigatório."],
      unique: true,
      lowercase: true, // Converte o email para minúsculo
      trim: true,
    },
    password: {
      type: String,
      required: [true, "O campo 'password' é obrigatório."],
    },
    photo: {
      type: String,
      default: null,
    },
    // Tokens de redefinição de senha
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    // Adiciona createdAt e updatedAt
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
