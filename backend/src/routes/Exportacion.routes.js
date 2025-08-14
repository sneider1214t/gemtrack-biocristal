import { Router } from "express";
import { pool } from "../config/db.js";
const router = Router();

// Obtener todas las exportaciones
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Exportacion');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las exportaciones' });
    }
});

// Obtener una exportación por su ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Exportacion WHERE id_exportacion = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Exportación no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la exportación' });
    }
});

// Crear una nueva exportación
router.post('/', async (req, res) => {
    const { id_exportacion, fecha_exportacion, sistema_destino, documento_usuario } = req.body;

    if (!id_exportacion || !fecha_exportacion || !sistema_destino || !documento_usuario) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        await pool.query(
            'INSERT INTO Exportacion (id_exportacion, fecha_exportacion, sistema_destino, documento_usuario) VALUES (?, ?, ?, ?)',
            [id_exportacion, fecha_exportacion, sistema_destino, documento_usuario]
        );
        res.status(201).json({ id_exportacion, fecha_exportacion, sistema_destino, documento_usuario });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la exportación' });
    }
});

// Actualizar una exportación existente
router.put('/:id', async (req, res) => {
    const { fecha_exportacion, sistema_destino, documento_usuario } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE Exportacion SET fecha_exportacion = ?, sistema_destino = ?, documento_usuario = ? WHERE id_exportacion = ?',
            [fecha_exportacion, sistema_destino, documento_usuario, req.params.id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Exportación no encontrada' });

        res.json({ message: 'Exportación actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la exportación' });
    }
});

// Eliminar una exportación
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Exportacion WHERE id_exportacion = ?', [req.params.id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Exportación no encontrada' });

        res.json({ message: 'Exportación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la exportación' });
    }
});

export default router;
