import request from 'supertest';
import app from '../../index.js';

describe('↩️ API /api/devolucion - Biocristal', () => {
  const devolucionNueva = {
    codigo_devolucion: 'DEV001',
    fecha_devolucion: '2025-07-20 10:00:00',
    motivo_devolucion: 'Producto defectuoso',
    codigo_factura: 'FAC001',
    codigo_producto: 'PROD001'
  };

  const devolucionActualizada = {
    fecha_devolucion: '2025-07-21 15:00:00',
    motivo_devolucion: 'No era el producto correcto',
    codigo_factura: 'FAC001',
    codigo_producto: 'PROD002'
  };

  let stockAntes = 0;

  test('📦 Crear devolución y aumentar stock', async () => {
    const resStock = await request(app).get(`/api/productos/${devolucionNueva.codigo_producto}`).expect(200);
    stockAntes = resStock.body.stock;

    const res = await request(app)
      .post('/api/devolucion')
      .send(devolucionNueva)
      .expect(201);

    console.log('✅ Devolución creada:', res.body);
    expect(res.body.codigo_devolucion).toBe(devolucionNueva.codigo_devolucion);

    const check = await request(app).get(`/api/productos/${devolucionNueva.codigo_producto}`).expect(200);
    expect(check.body.stock).toBe(stockAntes + 1);
  });

  test('📋 Obtener todas las devoluciones', async () => {
    const res = await request(app)
      .get('/api/devolucion')
      .expect(200);

    console.log('📚 Todas las devoluciones:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('🔍 Obtener devolución por código', async () => {
    const res = await request(app)
      .get(`/api/devolucion/${devolucionNueva.codigo_devolucion}`)
      .expect(200);

    console.log('🔎 Devolución encontrada:', res.body);
    expect(res.body.codigo_devolucion).toBe(devolucionNueva.codigo_devolucion);
  });

  test('✏️ Actualizar devolución', async () => {
    const res = await request(app)
      .put(`/api/devolucion/${devolucionNueva.codigo_devolucion}`)
      .send(devolucionActualizada)
      .expect(200);

    console.log('🛠️ Devolución actualizada:', res.body);
    expect(res.body.message).toBe('Devolución actualizada correctamente');
  });

  test('🔁 Confirmar devolución actualizada', async () => {
    const res = await request(app)
      .get(`/api/devolucion/${devolucionNueva.codigo_devolucion}`)
      .expect(200);

    console.log('📌 Devolución actualizada:', res.body);
    expect(res.body.motivo_devolucion).toBe(devolucionActualizada.motivo_devolucion);
  });

  test('🗑️ Eliminar devolución', async () => {
    const res = await request(app)
      .delete(`/api/devolucion/${devolucionNueva.codigo_devolucion}`)
      .expect(200);

    console.log('🧹 Devolución eliminada:', res.body);
    expect(res.body.message).toBe('Devolución eliminada correctamente');

    const check = await request(app)
      .get(`/api/devolucion/${devolucionNueva.codigo_devolucion}`)
      .expect(404);

    console.log(`❌ Confirmado: devolución con código ${devolucionNueva.codigo_devolucion} fue eliminada`);
  });
});
