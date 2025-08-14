import request from 'supertest';
import mysql from 'mysql2/promise';
import app from '../../index.js';

describe('🧾 API /api/factura - Biocristal', () => {
  beforeAll(async () => {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    await conn.query("DELETE FROM Factura WHERE codigo_factura = 'FAC002'");
    await conn.query(`
      UPDATE Productos 
      SET stock = 100 
      WHERE codigo_producto IN ('PROD001','PROD002','PROD003')
    `);
    await conn.end();
  });

  const facturaNueva = {
    codigo_factura: 'FAC002',
    fecha_factura: '2025-07-02 14:00:00',
    total_factura: 120000,
    codigo_transaccion: 'TRANS001',
    documento_cliente: 2001,
    productos_vendidos: [
      { codigo_producto: 'PROD001', cantidad: 2, precio_venta: 10000 },
      { codigo_producto: 'PROD002', cantidad: 1, precio_venta: 20000 }
    ]
  };

  const facturaActualizada = {
    fecha_factura: '2025-07-03 10:30:00',
    total_factura: 135000,
    codigo_transaccion: 'TRANS001',
    documento_cliente: 2001,
    productos_vendidos: [
      { codigo_producto: 'PROD001', cantidad: 3, precio_venta: 10000 },
      { codigo_producto: 'PROD003', cantidad: 2, precio_venta: 17500 }
    ]
  };

  const getStock = async (codigo) => {
    const r = await request(app).get(`/api/productos/${codigo}`).expect(200);
    return r.body.stock ?? 0;
  };

  it('📦 Crear factura y reducir stock', async () => {
    const stockAntes = {};
    for (const p of facturaNueva.productos_vendidos) {
      stockAntes[p.codigo_producto] = await getStock(p.codigo_producto);
    }

    const res = await request(app)
      .post('/api/factura')
      .send(facturaNueva)
      .expect(201);

    expect(res.body.codigo_factura).toBe(facturaNueva.codigo_factura);

    for (const p of facturaNueva.productos_vendidos) {
      const esperado = stockAntes[p.codigo_producto] - p.cantidad;
      const ahora = await getStock(p.codigo_producto);
      expect(ahora).toBe(esperado);
    }
  });

  it('📋 Obtener todas las facturas', async () => {
    const res = await request(app).get('/api/factura').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('🔍 Obtener factura por código', async () => {
    const res = await request(app).get(`/api/factura/${facturaNueva.codigo_factura}`).expect(200);
    expect(res.body.codigo_factura).toBe(facturaNueva.codigo_factura);
    expect(Array.isArray(res.body.productos_vendidos)).toBe(true);
  });

  it('✏️ Actualizar factura y ajustar stock', async () => {
    const stockPrevio = {};
    const cods = [...new Set([
      ...facturaNueva.productos_vendidos.map(p => p.codigo_producto),
      ...facturaActualizada.productos_vendidos.map(p => p.codigo_producto),
    ])];
    for (const c of cods) stockPrevio[c] = await getStock(c);

    const res = await request(app)
      .put(`/api/factura/${facturaNueva.codigo_factura}`)
      .send(facturaActualizada)
      .expect(200);

    expect(res.body.message).toBe('Factura actualizada correctamente');

    const toMap = (arr) => arr.reduce((m, it) => {
      m[it.codigo_producto] = (m[it.codigo_producto] ?? 0) + Number(it.cantidad ?? it.cantidad_vendida ?? 0);
      return m;
    }, {});
    const prev = toMap(facturaNueva.productos_vendidos);
    const next = toMap(facturaActualizada.productos_vendidos);

    for (const c of cods) {
      const delta = (next[c] ?? 0) - (prev[c] ?? 0);
      const esperado = stockPrevio[c] - delta;
      const ahora = await getStock(c);
      expect(ahora).toBe(esperado);
    }
  });

  it('🗑️ Eliminar factura', async () => {
    const res = await request(app).delete(`/api/factura/${facturaNueva.codigo_factura}`).expect(200);
    expect(res.body.message).toBe('Factura eliminada correctamente');
  });

  it('🚫 Verificar eliminación', async () => {
    await request(app).get(`/api/factura/${facturaNueva.codigo_factura}`).expect(404);
  });
});
