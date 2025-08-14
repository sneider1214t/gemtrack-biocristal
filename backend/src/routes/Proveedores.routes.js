import { Router } from "express";
import { pool } from "../config/db.js";
const router = Router();

// Obtener todos los proveedores
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Proveedores');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los proveedores' });
    }
});

// Obtener un proveedor por su NIT
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Proveedores WHERE nit_proveedor = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el proveedor' });
    }
});

// Crear un nuevo proveedor
router.post('/', async (req, res) => {
    const { nit_proveedor, nombre_proveedor, direccion_proveedor, email_proveedor } = req.body;

    if (!nit_proveedor || !nombre_proveedor || !direccion_proveedor || !email_proveedor) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        await pool.query(
            'INSERT INTO Proveedores (nit_proveedor, nombre_proveedor, direccion_proveedor, email_proveedor) VALUES (?, ?, ?, ?)',
            [nit_proveedor, nombre_proveedor, direccion_proveedor, email_proveedor]
        );
        res.status(201).json({ nit_proveedor, nombre_proveedor, direccion_proveedor, email_proveedor });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el proveedor' });
    }
});

// Actualizar un proveedor existente
router.put('/:id', async (req, res) => {
    const { nombre_proveedor, direccion_proveedor, email_proveedor } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE Proveedores SET nombre_proveedor = ?, direccion_proveedor = ?, email_proveedor = ? WHERE nit_proveedor = ?',
            [nombre_proveedor, direccion_proveedor, email_proveedor, req.params.id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Proveedor no encontrado' });

        res.json({ message: 'Proveedor actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el proveedor' });
    }
});

// Eliminar un proveedor
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Proveedores WHERE nit_proveedor = ?', [req.params.id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Proveedor no encontrado' });

        res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el proveedor' });
    }
});

export default router;
