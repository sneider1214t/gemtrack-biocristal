import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Obtener todas las facturas
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Factura');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las facturas' });
    }
});

// Obtener una factura por su código
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Factura WHERE codigo_factura = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la factura' });
    }
});

// Crear una nueva factura
router.post('/', async (req, res) => {
    const { codigo_factura, fecha_factura, tipo_pago, total_factura, codigo_transaccion, documento_cliente } = req.body;

    if (!codigo_factura || !fecha_factura || tipo_pago === undefined || !total_factura || !codigo_transaccion || !documento_cliente) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        await pool.query(
            'INSERT INTO Factura (codigo_factura, fecha_factura, tipo_pago, total_factura, codigo_transaccion, documento_cliente) VALUES (?, ?, ?, ?, ?, ?)',
            [codigo_factura, fecha_factura, tipo_pago, total_factura, codigo_transaccion, documento_cliente]
        );
        res.status(201).json({ codigo_factura, fecha_factura, tipo_pago, total_factura, codigo_transaccion, documento_cliente });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la factura' });
    }
});

// Actualizar una factura existente
router.put('/:id', async (req, res) => {
    const { fecha_factura, tipo_pago, total_factura, codigo_transaccion, documento_cliente } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE Factura SET fecha_factura = ?, tipo_pago = ?, total_factura = ?, codigo_transaccion = ?, documento_cliente = ? WHERE codigo_factura = ?',
            [fecha_factura, tipo_pago, total_factura, codigo_transaccion, documento_cliente, req.params.id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Factura no encontrada' });

        res.json({ message: 'Factura actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la factura' });
    }
});

// Eliminar una factura
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Factura WHERE codigo_factura = ?', [req.params.id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Factura no encontrada' });

        res.json({ message: 'Factura eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la factura' });
    }
});

export default router;
