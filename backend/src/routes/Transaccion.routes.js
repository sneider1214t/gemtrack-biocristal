import { Router } from "express";
import { pool } from "../config/db.js";
const router = Router();

// Obtener todas las transacciones
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Transaccion');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las transacciones' });
    }
});

// Obtener una transacción por su código
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Transaccion WHERE codigo_transaccion = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Transacción no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la transacción' });
    }
});

// Crear una nueva transacción
router.post('/', async (req, res) => {
    const { codigo_transaccion, fecha_transaccion, tipo_transaccion, ingreso_caja, egreso_caja, documento_usuario } = req.body;

    if (!codigo_transaccion || !fecha_transaccion || tipo_transaccion === undefined || ingreso_caja === undefined || egreso_caja === undefined || !documento_usuario) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // ✅ Validar tipo_transaccion
    if (!['Efectivo', 'Transferencia'].includes(tipo_transaccion)) {
        return res.status(400).json({ error: 'El tipo de transacción debe ser "Efectivo" o "Transferencia"' });
    }

    try {
        await pool.query(
            'INSERT INTO Transaccion (codigo_transaccion, fecha_transaccion, tipo_transaccion, ingreso_caja, egreso_caja, documento_usuario) VALUES (?, ?, ?, ?, ?, ?)',
            [codigo_transaccion, fecha_transaccion, tipo_transaccion, ingreso_caja, egreso_caja, documento_usuario]
        );
        res.status(201).json({ codigo_transaccion, fecha_transaccion, tipo_transaccion, ingreso_caja, egreso_caja, documento_usuario });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la transacción' });
    }
});

// Actualizar una transacción existente
router.put('/:id', async (req, res) => {
    const { fecha_transaccion, tipo_transaccion, ingreso_caja, egreso_caja, documento_usuario } = req.body;

    // ✅ Validar tipo_transaccion
    if (tipo_transaccion && !['Efectivo', 'Transferencia'].includes(tipo_transaccion)) {
        return res.status(400).json({ error: 'El tipo de transacción debe ser "Efectivo" o "Transferencia"' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE Transaccion SET fecha_transaccion = ?, tipo_transaccion = ?, ingreso_caja = ?, egreso_caja = ?, documento_usuario = ? WHERE codigo_transaccion = ?',
            [fecha_transaccion, tipo_transaccion, ingreso_caja, egreso_caja, documento_usuario, req.params.id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Transacción no encontrada' });

        res.json({ message: 'Transacción actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la transacción' });
    }
});

// Eliminar una transacción
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Transaccion WHERE codigo_transaccion = ?', [req.params.id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Transacción no encontrada' });

        res.json({ message: 'Transacción eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la transacción' });
    }
});

export default router;
