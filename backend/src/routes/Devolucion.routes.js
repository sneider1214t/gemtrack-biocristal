import { Router } from "express";
import { pool } from "../config/db.js";

const router = Router();

// Obtener todas las devoluciones
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Devolucion");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las devoluciones" });
  }
});

// Obtener una devolución por código
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM Devolucion WHERE codigo_devolucion = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Devolución no encontrada" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la devolución" });
  }
});

// Crear una devolución (+1 al stock del producto)
router.post("/", async (req, res) => {
  const { codigo_devolucion, fecha_devolucion, motivo_devolucion, codigo_factura, codigo_producto } = req.body;

  if (!codigo_devolucion || !fecha_devolucion || !motivo_devolucion || !codigo_factura || !codigo_producto) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar existencia de factura (opcional pero recomendado)
    const [frows] = await conn.query("SELECT codigo_factura FROM Factura WHERE codigo_factura = ? FOR UPDATE", [codigo_factura]);
    if (!frows.length) throw new Error(`La factura ${codigo_factura} no existe`);

    // Verificar producto
    const [prows] = await conn.query("SELECT stock FROM Productos WHERE codigo_producto = ? FOR UPDATE", [codigo_producto]);
    if (!prows.length) throw new Error(`El producto ${codigo_producto} no existe`);

    // Insertar devolución
    await conn.query(
      "INSERT INTO Devolucion (codigo_devolucion, fecha_devolucion, motivo_devolucion, codigo_factura, codigo_producto) VALUES (?, ?, ?, ?, ?)",
      [codigo_devolucion, fecha_devolucion, motivo_devolucion, codigo_factura, codigo_producto]
    );

    // Aumentar stock en +1
    await conn.query(
      "UPDATE Productos SET stock = stock + 1 WHERE codigo_producto = ?",
      [codigo_producto]
    );

    await conn.commit();

    res.status(201).json({ codigo_devolucion, fecha_devolucion, motivo_devolucion, codigo_factura, codigo_producto });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: "Error al crear la devolución", details: error.message });
  } finally {
    conn.release();
  }
});

// Actualizar una devolución existente (no toca stock)
router.put("/:id", async (req, res) => {
  const { fecha_devolucion, motivo_devolucion, codigo_factura, codigo_producto } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE Devolucion SET fecha_devolucion = ?, motivo_devolucion = ?, codigo_factura = ?, codigo_producto = ? WHERE codigo_devolucion = ?",
      [fecha_devolucion, motivo_devolucion, codigo_factura, codigo_producto, req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Devolución no encontrada" });

    res.json({ message: "Devolución actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la devolución" });
  }
});

// Eliminar una devolución (no toca stock)
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM Devolucion WHERE codigo_devolucion = ?", [req.params.id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Devolución no encontrada" });

    res.json({ message: "Devolución eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la devolución" });
  }
});

export default router;
