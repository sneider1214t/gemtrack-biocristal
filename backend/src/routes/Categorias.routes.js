import { Router } from "express";
import { pool } from "../config/db.js";
const router = Router();

// Obtener todas las categorías
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Categorias");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las categorías" });
  }
});

// Obtener una categoría por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Categorias WHERE id_categoria = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la categoría" });
  }
});

// Crear una nueva categoría
router.post("/", async (req, res) => {
  const { id_categoria, nombre_categoria } = req.body;

  if (!id_categoria || !nombre_categoria) {
    return res
      .status(400)
      .json({ error: "ID y nombre de la categoría son requeridos" });
  }

  try {
    await pool.query(
      "INSERT INTO Categorias (id_categoria, nombre_categoria) VALUES (?, ?)",
      [id_categoria, nombre_categoria]
    );
    res.status(201).json({ id_categoria, nombre_categoria });
  } catch (error) {
    res.status(500).json({ error: "Error al crear la categoría" });
  }
});

// Actualizar una categoría existente
router.put("/:id", async (req, res) => {
  const { nombre_categoria } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE Categorias SET nombre_categoria = ? WHERE id_categoria = ?",
      [nombre_categoria, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json({ message: "Categoría actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la categoría" });
  }
});

// Eliminar una categoría
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM Categorias WHERE id_categoria = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la categoría" });
  }
});

export default router;
