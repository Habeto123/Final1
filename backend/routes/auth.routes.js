const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario.model');

// Registrar usuario
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const nuevoUsuario = new Usuario({ nombre, email, password: hashedPassword });
    await nuevoUsuario.save();
    res.json({ msg: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ msg: 'Credenciales inválidas' });
    const esMatch = await bcrypt.compare(password, usuario.password);
    if (!esMatch) return res.status(400).json({ msg: 'Credenciales inválidas' });
    const payload = { userId: usuario._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;