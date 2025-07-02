import { Router } from "express";
import { pool } from "../config/db.js";
const router = Router();

// Obtener todos los mantenimientos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Mantenimiento');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los mantenimientos' });
    }
});

// Obtener un mantenimiento por id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Mantenimiento WHERE id_mantenimiento = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Mantenimiento no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el mantenimiento' });
    }
});

// Crear un mantenimiento
router.post('/', async (req, res) => {
    const { id_mantenimiento, fecha_mantenimiento, proximo_mantenimiento, codigo_producto } = req.body;

    if (!id_mantenimiento || !fecha_mantenimiento || !proximo_mantenimiento || !codigo_producto) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        await pool.query(
            'INSERT INTO Mantenimiento (id_mantenimiento, fecha_mantenimiento, proximo_mantenimiento, codigo_producto) VALUES (?, ?, ?, ?)',
            [id_mantenimiento, fecha_mantenimiento, proximo_mantenimiento, codigo_producto]
        );
        res.status(201).json({ id_mantenimiento, fecha_mantenimiento, proximo_mantenimiento, codigo_producto });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el mantenimiento' });
    }
});

// Actualizar un mantenimiento existente
router.put('/:id', async (req, res) => {
    const { fecha_mantenimiento, proximo_mantenimiento, codigo_producto } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE Mantenimiento SET fecha_mantenimiento = ?, proximo_mantenimiento = ?, codigo_producto = ? WHERE id_mantenimiento = ?',
            [fecha_mantenimiento, proximo_mantenimiento, codigo_producto, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Mantenimiento no encontrado' });

        res.json({ message: 'Mantenimiento actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el mantenimiento' });
    }
});

// Eliminar un mantenimiento
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Mantenimiento WHERE id_mantenimiento = ?', [req.params.id]);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Mantenimiento no encontrado' });

        res.json({ message: 'Mantenimiento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el mantenimiento' });
    }
});

export default router;
