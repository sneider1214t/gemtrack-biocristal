import { Router } from "express";
import { pool } from "../config/db.js";
const router = Router();

// Obtener todas las facturas
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Factura');
        // Si productos_vendidos existe, lo transformamos de JSON a objeto JS
        const facturas = rows.map(row => ({
            ...row,
            productos_vendidos: row.productos_vendidos ? JSON.parse(row.productos_vendidos) : null
        }));
        res.json(facturas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las facturas' });
    }
});

// Obtener una factura por su código
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Factura WHERE codigo_factura = ?', [id]);
        if (rows.length === 0)
            return res.status(404).json({ message: 'Factura no encontrada' });

        const factura = rows[0];
        factura.productos_vendidos = factura.productos_vendidos ? JSON.parse(factura.productos_vendidos) : null;
        res.json(factura);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la factura' });
    }
});

// Crear una nueva factura
router.post('/', async (req, res) => {
    const { codigo_factura, fecha_factura, tipo_pago, total_factura, codigo_transaccion, documento_cliente, productos_vendidos } = req.body;

    if (!codigo_factura || !fecha_factura || tipo_pago === undefined || !total_factura || !codigo_transaccion || !documento_cliente)
        return res.status(400).json({ error: 'Todos los campos son requeridos' });

    try {
        await pool.query(
            'INSERT INTO Factura (codigo_factura, fecha_factura, tipo_pago, total_factura, codigo_transaccion, documento_cliente, productos_vendidos) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                codigo_factura,
                fecha_factura,
                tipo_pago,
                total_factura,
                codigo_transaccion,
                documento_cliente,
                productos_vendidos ? JSON.stringify(productos_vendidos) : null
            ]
        );

        res.status(201).json({
            codigo_factura,
            fecha_factura,
            tipo_pago,
            total_factura,
            codigo_transaccion,
            documento_cliente,
            productos_vendidos
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la factura' });
    }
});

// Actualizar una factura existente
router.put('/:id', async (req, res) => {
    const { fecha_factura, tipo_pago, total_factura, codigo_transaccion, documento_cliente, productos_vendidos } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE Factura SET fecha_factura = ?, tipo_pago = ?, total_factura = ?, codigo_transaccion = ?, documento_cliente = ?, productos_vendidos = ? WHERE codigo_factura = ?',
            [
                fecha_factura,
                tipo_pago,
                total_factura,
                codigo_transaccion,
                documento_cliente,
                productos_vendidos ? JSON.stringify(productos_vendidos) : null,
                req.params.id
            ]
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
