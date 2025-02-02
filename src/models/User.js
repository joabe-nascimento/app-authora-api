// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Campo para armazenar a foto do perfil (em Base64)
  photo: {
    type: String,
    default: null,
  },
  // Campos para redefinição de senha:
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("User", userSchema);
