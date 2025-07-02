import { Router } from "express";
import { pool } from "../config/db.js";
const router = Router();

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
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
});

// Crear un usuario
router.post("/", async (req, res) => {
  const {
    documento_usuario,
    nombre_usuario,
    email_usuario,
    rol_usuario,
    contraseña_usuario,
  } = req.body;

  if (
    !documento_usuario ||
    !nombre_usuario ||
    !email_usuario ||
    rol_usuario === undefined ||
    !contraseña_usuario
  ) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO Usuarios (documento_usuario, nombre_usuario, email_usuario, rol_usuario, contraseña_usuario) VALUES (?, ?, ?, ?, ?)",
      [
        documento_usuario,
        nombre_usuario,
        email_usuario,
        rol_usuario,
        contraseña_usuario,
      ]
    );
    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el usuario" });
  }
});

// Actualizar un usuario existente
router.put("/:id", async (req, res) => {
  const { nombre_usuario, email_usuario, rol_usuario, contraseña_usuario } =
    req.body;
  const { id } = req.params;

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

// Eliminar un usuario
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

export default router;
