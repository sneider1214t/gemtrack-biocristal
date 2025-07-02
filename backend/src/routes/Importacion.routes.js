import { Router } from "express";
import { pool } from "../config/db.js";
const router = Router();

// Obtener todas las importaciones
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Importacion');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las importaciones' });
    }
});

// Obtener una importación por id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Importacion WHERE id_importacion = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Importación no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la importación' });
    }
});

// Crear una nueva importación
router.post('/', async (req, res) => {
    const { id_importacion, fecha_importacion, sistema_origen, documento_usuario } = req.body;

    if (!id_importacion || !fecha_importacion || !sistema_origen || !documento_usuario) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        await pool.query(
            'INSERT INTO Importacion (id_importacion, fecha_importacion, sistema_origen, documento_usuario) VALUES (?, ?, ?, ?)',
            [id_importacion, fecha_importacion, sistema_origen, documento_usuario]
        );
        res.status(201).json({ id_importacion, fecha_importacion, sistema_origen, documento_usuario });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la importación' });
    }
});

// Actualizar una importación existente
router.put('/:id', async (req, res) => {
    const { fecha_importacion, sistema_origen, documento_usuario } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE Importacion SET fecha_importacion = ?, sistema_origen = ?, documento_usuario = ? WHERE id_importacion = ?',
            [fecha_importacion, sistema_origen, documento_usuario, req.params.id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Importación no encontrada' });

        res.json({ message: 'Importación actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la importación' });
    }
});

// Eliminar una importación
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Importacion WHERE id_importacion = ?', [req.params.id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Importación no encontrada' });

        res.json({ message: 'Importación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la importación' });
    }
});

export default router;
