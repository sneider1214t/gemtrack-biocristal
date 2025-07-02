import { Router } from "express";
import { pool } from "../config/db.js";
const router = Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Productos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
});

// Obtener un producto por su código
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Productos WHERE codigo_producto = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto' });
    }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
    const {
        codigo_producto, nombre_producto, unidad_medida, precio_compra, precio_venta,  nombre_ubicacion, nit_proveedor, id_categoria
    } = req.body;

    if (!codigo_producto || !nombre_producto || !unidad_medida || !precio_compra || !precio_venta || !nombre_ubicacion || !nit_proveedor || !id_categoria) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        await pool.query(
            'INSERT INTO Productos (codigo_producto, nombre_producto, unidad_medida, precio_compra, precio_venta, nombre_ubicacion, nit_proveedor, id_categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [codigo_producto, nombre_producto, unidad_medida, precio_compra, precio_venta, nombre_ubicacion, nit_proveedor, id_categoria]
        );
        res.status(201).json({ message: 'Producto creado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

// Actualizar un producto existente
router.put('/:id', async (req, res) => {
    const {
        nombre_producto, unidad_medida, precio_compra, precio_venta, nombre_ubicacion,  nit_proveedor, id_categoria
    } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE Productos SET nombre_producto = ?, unidad_medida = ?, precio_compra = ?, precio_venta = ?, nombre_ubicacion = ?, nit_proveedor = ?, id_categoria = ? WHERE codigo_producto = ?',
            [nombre_producto, unidad_medida, precio_compra, precio_venta, nombre_ubicacion, nit_proveedor, id_categoria, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Productos WHERE codigo_producto = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

export default router;
