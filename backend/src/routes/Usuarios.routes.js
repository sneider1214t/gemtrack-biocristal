import { Router } from "express";
import { pool } from "../config/db.js";
import { hash, compare } from "../config/encrypting.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const router = Router();

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/* ------------------- Autenticación ------------------- */

// Iniciar sesión
router.post("/login", async (req, res) => {
  const { email_usuario, contraseña_usuario } = req.body;

  if (!email_usuario || !contraseña_usuario) {
    return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
  }

  try {
    // Buscar usuario por email
    const [users] = await pool.query(
      "SELECT * FROM Usuarios WHERE email_usuario = ?",
      [email_usuario]
    );

    const user = users[0];
    
    // Verificar si el usuario existe
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isPasswordValid = await compare(contraseña_usuario, user.contraseña_usuario);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Crear token JWT
    const token = jwt.sign(
      { 
        id: user.documento_usuario,
        rol: user.rol_usuario 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '8h' }
    );

    // Enviar respuesta exitosa
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        documento: user.documento_usuario,
        nombre: user.nombre_usuario,
        email: user.email_usuario,
        rol: user.rol_usuario
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

/* ------------------- CRUD Usuarios ------------------- */

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Usuarios");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
});

// Obtener un usuario por documento
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Usuarios WHERE documento_usuario = ?",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
});

// Crear usuario
router.post("/", async (req, res) => {
  const {
    documento_usuario,
    nombre_usuario,
    email_usuario,
    rol_usuario,
    contraseña_usuario,
  } = req.body;

  const rolesPermitidos = ["Administrador", "Empleado"];

  if (
    !documento_usuario ||
    !nombre_usuario ||
    !email_usuario ||
    !contraseña_usuario ||
    !rolesPermitidos.includes(rol_usuario)
  ) {
    return res.status(400).json({
      error:
        "Todos los campos son requeridos y el rol debe ser Administrador o Empleado",
    });
  }

  const passHash = await hash(contraseña_usuario);
  try {
    await pool.query(
      "INSERT INTO Usuarios (documento_usuario, nombre_usuario, email_usuario, rol_usuario, contraseña_usuario) VALUES (?, ?, ?, ?, ?)",
      [
        documento_usuario,
        nombre_usuario,
        email_usuario,
        rol_usuario,
        passHash,
      ]
    );

    res.status(201).json({
      documento_usuario,
      nombre_usuario,
      email_usuario,
      rol_usuario,
      contraseña_usuario: passHash,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el usuario" });
  }
});

// Actualizar usuario
router.put("/:id", async (req, res) => {
  const { nombre_usuario, email_usuario, rol_usuario, contraseña_usuario } =
    req.body;
  const { id } = req.params;

  const rolesPermitidos = ["Administrador", "Empleado"];

  if (!rolesPermitidos.includes(rol_usuario)) {
    return res.status(400).json({
      error: "El rol debe ser Administrador o Empleado",
    });
  }

  try {
    const [result] = await pool.query(
      "UPDATE Usuarios SET nombre_usuario = ?, email_usuario = ?, rol_usuario = ?, contraseña_usuario = ? WHERE documento_usuario = ?",
      [nombre_usuario, email_usuario, rol_usuario, contraseña_usuario, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
});

// Eliminar usuario
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM Usuarios WHERE documento_usuario = ?",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
});

/* ------------------- Recuperar contraseña ------------------- */

// Solicitar enlace de recuperación
router.post("/forgot-password", async (req, res) => {
  const { email_usuario } = req.body;

  try {
    const [user] = await pool.query(
      "SELECT * FROM usuarios WHERE email_usuario = ?",
      [email_usuario]
    );

    if (!user.length) {
      return res.json({
        message:
          "Si el correo existe, se enviará un enlace de recuperación",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await pool.query(
      "UPDATE usuarios SET reset_token = ?, reset_token_created_at = NOW() WHERE email_usuario = ?",
      [token, email_usuario]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Biocristal Sistem" <${process.env.EMAIL_USER}>`,
      to: email_usuario,
      subject: "Recuperar contraseña",
      html: `<p>Hola bienvenido a Biocristal, haz clic en este enlace para cambiar tu contraseña y seguir disfrutando de nuestro sistema (Ten en cuenta que expira en 5 minutos y el uso de este enlace es de una sola vez):</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({
      message:
        "Si el correo existe, se enviará un enlace de recuperación",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al enviar el enlace" });
  }
});

// Cambiar contraseña con token
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { nueva_contraseña } = req.body;

  try {
    const [user] = await pool.query(
      "SELECT * FROM usuarios WHERE reset_token = ? AND reset_token_created_at > NOW() - INTERVAL 5 MINUTE",
      [token]
    );

    if (!user.length) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const hashedPassword = await hash(nueva_contraseña);

    await pool.query(
      "UPDATE usuarios SET contraseña_usuario = ?, reset_token = NULL, reset_token_created_at = NULL WHERE documento_usuario = ?",
      [hashedPassword, user[0].documento_usuario]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al restablecer la contraseña" });
  }
});

export default router;
