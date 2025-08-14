import { Router } from "express";
import { pool } from "../config/db.js";

const router = Router();

/* Utilidad: parsear productos_vendidos con tolerancia */
function parseProductosVendidosEntrada(input) {
  let arr = input;
  if (!arr) return [];
  if (typeof arr === "string") {
    try { arr = JSON.parse(arr); } catch { return []; }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((p) => ({
      codigo_producto: p.codigo_producto,
      cantidad_vendida:
        p.cantidad_vendida !== undefined ? Number(p.cantidad_vendida) : Number(p.cantidad),
      precio_venta:
        p.precio_venta !== undefined ? Number(p.precio_venta) : (p.precio ?? null),
    }))
    .filter(
      (p) =>
        p.codigo_producto &&
        Number.isFinite(p.cantidad_vendida) &&
        p.cantidad_vendida > 0
    );
}

function safeParseJSONField(row, fieldName) {
  const raw = row[fieldName];
  if (!raw) return null;
  try { return typeof raw === "string" ? JSON.parse(raw) : raw; }
  catch { return null; }
}

/* --------- GET: todas --------- */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Factura");
    const out = rows.map((r) => ({
      ...r,
      productos_vendidos: safeParseJSONField(r, "productos_vendidos"),
    }));
    res.json(out);
  } catch {
    res.status(500).json({ message: "Error al obtener las facturas" });
  }
});

/* --------- GET: por id --------- */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Factura WHERE codigo_factura = ?",
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Factura no encontrada" });
    const factura = rows[0];
    factura.productos_vendidos = safeParseJSONField(factura, "productos_vendidos");
    res.json(factura);
  } catch {
    res.status(500).json({ message: "Error al obtener la factura" });
  }
});

/* --------- POST: crear (descuenta stock) --------- */
router.post("/", async (req, res) => {
  const {
    codigo_factura,
    fecha_factura,
    total_factura,
    codigo_transaccion,
    documento_cliente,
    productos_vendidos,
  } = req.body;

  if (!codigo_factura || !fecha_factura || !total_factura || !codigo_transaccion || !documento_cliente) {
    return res.status(400).json({ error: "Todos los campos son requeridos (sin tipo_pago)" });
  }

  const items = parseProductosVendidosEntrada(productos_vendidos);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Descontar stock por cada ítem
    for (const it of items) {
      const [prdRows] = await conn.query(
        "SELECT stock FROM Productos WHERE codigo_producto = ? FOR UPDATE",
        [it.codigo_producto]
      );
      if (!prdRows.length) {
        await conn.rollback();
        return res.status(400).json({ error: `Producto ${it.codigo_producto} no existe` });
      }
      const stockActual = Number(prdRows[0].stock ?? 0);
      if (stockActual < it.cantidad_vendida) {
        await conn.rollback();
        return res.status(400).json({
          error: `Stock insuficiente para ${it.codigo_producto} (stock=${stockActual}, requerido=${it.cantidad_vendida})`,
        });
      }
      await conn.query(
        "UPDATE Productos SET stock = stock - ? WHERE codigo_producto = ?",
        [it.cantidad_vendida, it.codigo_producto]
      );
    }

    await conn.query(
      "INSERT INTO Factura (codigo_factura, fecha_factura, total_factura, codigo_transaccion, documento_cliente, productos_vendidos) VALUES (?, ?, ?, ?, ?, ?)",
      [
        codigo_factura,
        fecha_factura,
        total_factura,
        codigo_transaccion,
        documento_cliente,
        items.length ? JSON.stringify(items) : null,
      ]
    );

    await conn.commit();
    res.status(201).json({
      codigo_factura,
      fecha_factura,
      total_factura,
      codigo_transaccion,
      documento_cliente,
      productos_vendidos: productos_vendidos ?? items,
    });
  } catch {
    await conn.rollback();
    res.status(500).json({ error: "Error al crear la factura" });
  } finally {
    conn.release();
  }
});

/* --------- PUT: actualizar (ajusta stock por diferencia) --------- */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    fecha_factura,
    total_factura,
    codigo_transaccion,
    documento_cliente,
    productos_vendidos,
  } = req.body;

  const nuevos = parseProductosVendidosEntrada(productos_vendidos);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Leer factura actual y bloquear
    const [rows] = await conn.query(
      "SELECT productos_vendidos FROM Factura WHERE codigo_factura = ? FOR UPDATE",
      [id]
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ error: "Factura no encontrada" });
    }
    const actuales = parseProductosVendidosEntrada(rows[0].productos_vendidos);

    // Mapear cantidades por producto
    const qty = (arr) => {
      const m = new Map();
      for (const it of arr) {
        m.set(it.codigo_producto, (m.get(it.codigo_producto) ?? 0) + Number(it.cantidad_vendida));
      }
      return m;
    };
    const qtyActual = qty(actuales);
    const qtyNueva  = qty(nuevos);

    // Unión y deltas
    const codigos = new Set([...qtyActual.keys(), ...qtyNueva.keys()]);
    for (const cod of codigos) {
      const antes = qtyActual.get(cod) ?? 0;
      const despues = qtyNueva.get(cod) ?? 0;
      const delta = despues - antes; // >0 vender más, <0 devolver

      if (delta !== 0) {
        const [prdRows] = await conn.query(
          "SELECT stock FROM Productos WHERE codigo_producto = ? FOR UPDATE",
          [cod]
        );
        if (!prdRows.length) {
          await conn.rollback();
          return res.status(400).json({ error: `Producto ${cod} no existe` });
        }
        const stockActual = Number(prdRows[0].stock ?? 0);

        if (delta > 0) {
          if (stockActual < delta) {
            await conn.rollback();
            return res.status(400).json({
              error: `Stock insuficiente para ${cod} (stock=${stockActual}, requerido=${delta})`,
            });
          }
          await conn.query("UPDATE Productos SET stock = stock - ? WHERE codigo_producto = ?", [delta, cod]);
        } else {
          await conn.query("UPDATE Productos SET stock = stock + ? WHERE codigo_producto = ?", [-delta, cod]);
        }
      }
    }

    // Actualizar factura
    const [result] = await conn.query(
      "UPDATE Factura SET fecha_factura = ?, total_factura = ?, codigo_transaccion = ?, documento_cliente = ?, productos_vendidos = ? WHERE codigo_factura = ?",
      [
        fecha_factura,
        total_factura,
        codigo_transaccion,
        documento_cliente,
        nuevos.length ? JSON.stringify(nuevos) : null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Factura no encontrada" });
    }

    await conn.commit();
    res.json({ message: "Factura actualizada correctamente" });
  } catch {
    await conn.rollback();
    res.status(500).json({ error: "Error al actualizar la factura" });
  } finally {
    conn.release();
  }
});

/* --------- DELETE: eliminar (devuelve stock) --------- */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT productos_vendidos FROM Factura WHERE codigo_factura = ? FOR UPDATE",
      [id]
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ error: "Factura no encontrada" });
    }

    const items = parseProductosVendidosEntrada(rows[0].productos_vendidos);
    for (const it of items) {
      await conn.query(
        "UPDATE Productos SET stock = stock + ? WHERE codigo_producto = ?",
        [it.cantidad_vendida, it.codigo_producto]
      );
    }

    await conn.query("DELETE FROM Factura WHERE codigo_factura = ?", [id]);
    await conn.commit();
    res.json({ message: "Factura eliminada correctamente" });
  } catch {
    await conn.rollback();
    res.status(500).json({ error: "Error al eliminar la factura" });
  } finally {
    conn.release();
  }
});

export default router;
