// controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'secreto_super_seguro_para_mi_app'; // En producción esto va en variables de entorno (.env)

// 1. REGISTRO DE USUARIOS
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    
    db.run(query, [name, email, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      res.status(201).json({ message: 'Usuario registrado con éxito', userId: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 2. INICIO DE SESIÓN (LOGIN)
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Por favor ingresa correo y contraseña' });
  }

  const query = `SELECT * FROM users WHERE email = ?`;

  db.get(query, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Comparar contraseña ingresada con el hash guardado
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar Token de Sesión (JWT)
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  });
};