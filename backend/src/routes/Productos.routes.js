import { Router } from "express";
import { pool } from "../config/db.js";
import { upload } from "../config/multer.js"; // 📌 Configuración Multer
import path from "path";

const router = Router();

// 📌 Servir imágenes (acceso directo por URL)
router.use("/images", (req, res, next) => {
    res.sendFile(path.resolve(`uploads/${req.url}`));
});

// ✅ Obtener todos los productos
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM Productos");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los productos" });
    }
});

// ✅ Obtener un producto por su código
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM Productos WHERE codigo_producto = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el producto" });
    }
});

// ✅ Crear un nuevo producto con imagen
router.post("/", upload.single("imagen_producto"), async (req, res) => {
    const {
        codigo_producto,
        nombre_producto,
        unidad_medida,
        precio_compra,
        precio_venta,
        nombre_ubicacion,
        nit_proveedor,
        id_categoria,
        stock
    } = req.body;

    const imagen_producto = req.file ? req.file.filename : null;

    if (!codigo_producto || !nombre_producto || !unidad_medida || !precio_compra || !precio_venta || !nombre_ubicacion || !nit_proveedor || !id_categoria || stock === undefined) {
        return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (isNaN(stock) || stock < 0) {
        return res.status(400).json({ error: "El stock debe ser un número mayor o igual a 0" });
    }

    try {
        await pool.query(
            "INSERT INTO Productos (codigo_producto, nombre_producto, unidad_medida, precio_compra, precio_venta, nombre_ubicacion, nit_proveedor, id_categoria, imagen_producto, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [codigo_producto, nombre_producto, unidad_medida, precio_compra, precio_venta, nombre_ubicacion, nit_proveedor, id_categoria, imagen_producto, stock]
        );

        res.status(201).json({
            codigo_producto,
            nombre_producto,
            unidad_medida,
            precio_compra,
            precio_venta,
            nombre_ubicacion,
            nit_proveedor,
            id_categoria,
            imagen_producto,
            stock
        });
    } catch (error) {
        res.status(500).json({ error: "Error al crear el producto" });
    }
});

// ✅ Actualizar un producto (con opción de nueva imagen)
router.put("/:id", upload.single("imagen_producto"), async (req, res) => {
    const {
        nombre_producto,
        unidad_medida,
        precio_compra,
        precio_venta,
        nombre_ubicacion,
        nit_proveedor,
        id_categoria,
        stock
    } = req.body;

    if (stock !== undefined && (isNaN(stock) || stock < 0)) {
        return res.status(400).json({ error: "El stock debe ser un número mayor o igual a 0" });
    }

    const imagen_producto = req.file ? req.file.filename : null;

    try {
        let query = `
            UPDATE Productos 
            SET nombre_producto = ?, unidad_medida = ?, precio_compra = ?, precio_venta = ?, nombre_ubicacion = ?, nit_proveedor = ?, id_categoria = ?, stock = ?
        `;
        let params = [nombre_producto, unidad_medida, precio_compra, precio_venta, nombre_ubicacion, nit_proveedor, id_categoria, stock];

        if (imagen_producto) {
            query += ", imagen_producto = ?";
            params.push(imagen_producto);
        }

        query += " WHERE codigo_producto = ?";
        params.push(req.params.id);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ message: "Producto actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
});

// ✅ Eliminar un producto
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM Productos WHERE codigo_producto = ?", [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
});

export default router;
