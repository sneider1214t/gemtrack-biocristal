import { Router } from "express";
import { pool } from "../config/db.js";

const router = Router();

// Lista de estados permitidos
const estadosPermitidos = ['Ocupada', 'Con espacio'];

// Función para normalizar el estado (acepta 1/0 y los convierte)
function normalizarEstado(valor) {
    if (valor === 1 || valor === '1') return 'Ocupada';
    if (valor === 0 || valor === '0') return 'Con espacio';
    return valor;
}

// Obtener todas las ubicaciones
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Ubicacion');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las ubicaciones' });
    }
});

// Obtener una ubicación por su nombre
router.get('/:nombre', async (req, res) => {
    const { nombre } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM Ubicacion WHERE nombre_ubicacion = ?',
            [nombre]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Ubicación no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la ubicación' });
    }
});

// Crear una nueva ubicación
router.post('/', async (req, res) => {
    let { nombre_ubicacion, estado_ubicacion } = req.body;

    // Normalizar valor (si viene como 1/0 lo convierte)
    estado_ubicacion = normalizarEstado(estado_ubicacion);

    // Validación
    if (!nombre_ubicacion || !estadosPermitidos.includes(estado_ubicacion)) {
        return res.status(400).json({
            error: 'Nombre y estado válidos son requeridos (Ocupada o Con espacio)'
        });
    }

    try {
        await pool.query(
            'INSERT INTO Ubicacion (nombre_ubicacion, estado_ubicacion) VALUES (?, ?)',
            [nombre_ubicacion, estado_ubicacion]
        );
        res.status(201).json({ nombre_ubicacion, estado_ubicacion });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la ubicación' });
    }
});

// Actualizar una ubicación existente
router.put('/:nombre', async (req, res) => {
    let { estado_ubicacion } = req.body;

    // Normalizar valor (si viene como 1/0 lo convierte)
    estado_ubicacion = normalizarEstado(estado_ubicacion);

    // Validación
    if (!estadosPermitidos.includes(estado_ubicacion)) {
        return res.status(400).json({
            error: 'Estado válido requerido (Ocupada o Con espacio)'
        });
    }

    try {
        const [result] = await pool.query(
            'UPDATE Ubicacion SET estado_ubicacion = ? WHERE nombre_ubicacion = ?',
            [estado_ubicacion, req.params.nombre]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ubicación no encontrada' });
        }

        res.json({ message: 'Ubicación actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la ubicación' });
    }
});

// Eliminar una ubicación
router.delete('/:nombre', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM Ubicacion WHERE nombre_ubicacion = ?',
            [req.params.nombre]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ubicación no encontrada' });
        }

        res.json({ message: 'Ubicación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la ubicación' });
    }
});

export default router;
