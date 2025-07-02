import { Router } from "express";
import { pool } from "../config/db.js";
const router = Router();

// Obtener todas las devoluciones
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Devolucion');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las devoluciones' });
    }
});

// Obtener una devolución por código
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Devolucion WHERE codigo_devolucion = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Devolución no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la devolución' });
    }
});

// Crear una devolución
router.post('/', async (req, res) => {
    const { codigo_devolucion, fecha_devolucion, motivo_devolucion, codigo_factura, codigo_producto } = req.body;

    if (!codigo_devolucion || !fecha_devolucion || !motivo_devolucion || !codigo_factura || !codigo_producto) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        await pool.query(
            'INSERT INTO Devolucion (codigo_devolucion, fecha_devolucion, motivo_devolucion, codigo_factura, codigo_producto) VALUES (?, ?, ?, ?, ?)',
            [codigo_devolucion, fecha_devolucion, motivo_devolucion, codigo_factura, codigo_producto]
        );
        res.status(201).json({ codigo_devolucion, fecha_devolucion, motivo_devolucion, codigo_factura, codigo_producto });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la devolución' });
    }
});

// Actualizar una devolución existente
router.put('/:id', async (req, res) => {
    const { fecha_devolucion, motivo_devolucion, codigo_factura, codigo_producto } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE Devolucion SET fecha_devolucion = ?, motivo_devolucion = ?, codigo_factura = ?, codigo_producto = ? WHERE codigo_devolucion = ?',
            [fecha_devolucion, motivo_devolucion, codigo_factura, codigo_producto, req.params.id]
        );

        if (result.affectedRows === 0) 
            return res.status(404).json({ error: 'Devolución no encontrada' });

        res.json({ message: 'Devolución actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la devolución' });
    }
});

// Eliminar una devolución
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Devolucion WHERE codigo_devolucion = ?', [req.params.id]);

        if (result.affectedRows === 0) 
            return res.status(404).json({ error: 'Devolución no encontrada' });

        res.json({ message: 'Devolución eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la devolución' });
    }
});

export default router;
