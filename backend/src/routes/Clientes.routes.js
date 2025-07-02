import { Router } from "express";
import { pool } from "../config/db.js";
const router = Router();

// Obtener todos los clientes
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Clientes');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los clientes' });
    }
});

// Obtener un cliente por su documento
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Clientes WHERE documento_cliente = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el cliente' });
    }
});

// Crear un nuevo cliente
router.post('/', async (req, res) => {
    const { documento_cliente, nombre_cliente, email, telefono } = req.body;

    if (!documento_cliente || !nombre_cliente || !email || !telefono) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Clientes (documento_cliente, nombre_cliente, email, telefono) VALUES (?, ?, ?, ?)',
            [documento_cliente, nombre_cliente, email, telefono]
        );
        res.status(201).json({ documento_cliente, nombre_cliente, email, telefono });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el cliente' });
    }
});

// Actualizar un cliente existente
router.put('/:id', async (req, res) => {
    const { nombre_cliente, email, telefono } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE Clientes SET nombre_cliente = ?, email = ?, telefono = ? WHERE documento_cliente = ?',
            [nombre_cliente, email, telefono, req.params.id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Cliente no encontrado' });

        res.json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
});

// Eliminar un cliente
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Clientes WHERE documento_cliente = ?', [req.params.id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Cliente no encontrado' });

        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el cliente' });
    }
});

export default router;
