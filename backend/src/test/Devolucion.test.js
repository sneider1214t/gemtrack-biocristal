import request from 'supertest';
import app from '../../index.js';

describe('↩️ API /api/devolucion - Biocristal', () => {
  const devolucionNueva = {
    codigo_devolucion: 'DEV001',
    fecha_devolucion: '2025-07-02',
    motivo_devolucion: 'Producto defectuoso',
    codigo_factura: 'FAC001',
    codigo_producto: 'PROD001'
  };

  const devolucionActualizada = {
    fecha_devolucion: '2025-07-03',
    motivo_devolucion: 'Error en el envío',
    codigo_factura: 'FAC001',
    codigo_producto: 'PROD001'
  };

  it('📦 Crear devolución', async () => {
    const res = await request(app)
      .post('/api/devolucion')
      .send(devolucionNueva)
      .expect(201);

    console.log('✅ Devolución creada:', res.body);
    expect(res.body.codigo_devolucion).toBe(devolucionNueva.codigo_devolucion);
  });

  it('📋 Obtener todas las devoluciones', async () => {
    const res = await request(app)
      .get('/api/devolucion')
      .expect(200);

    console.log('📚 Todas las devoluciones:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('🔍 Obtener devolución por código', async () => {
    const res = await request(app)
      .get(`/api/devolucion/${devolucionNueva.codigo_devolucion}`)
      .expect(200);

    console.log('🔎 Devolución encontrada:', res.body);
    expect(res.body.codigo_devolucion).toBe(devolucionNueva.codigo_devolucion);
  });

  it('✏️ Actualizar devolución', async () => {
    const res = await request(app)
      .put(`/api/devolucion/${devolucionNueva.codigo_devolucion}`)
      .send(devolucionActualizada)
      .expect(200);

    console.log('🛠️ Devolución actualizada:', res.body);
    expect(res.body.message).toBe('Devolución actualizada correctamente');
  });

  it('🔁 Confirmar devolución actualizada', async () => {
    const res = await request(app)
      .get(`/api/devolucion/${devolucionNueva.codigo_devolucion}`)
      .expect(200);

    console.log('📌 Devolución actualizada:', res.body);
    expect(res.body.motivo_devolucion).toBe(devolucionActualizada.motivo_devolucion);
  });

  it('🗑️ Eliminar devolución', async () => {
    const res = await request(app)
      .delete(`/api/devolucion/${devolucionNueva.codigo_devolucion}`)
      .expect(200);

    console.log('🧹 Devolución eliminada:', res.body);
    expect(res.body.message).toBe('Devolución eliminada correctamente');
  });

  it('🚫 Verificar eliminación', async () => {
    await request(app)
      .get(`/api/devolucion/${devolucionNueva.codigo_devolucion}`)
      .expect(404);

    console.log(`❌ Confirmado: devolución con código ${devolucionNueva.codigo_devolucion} fue eliminada`);
  });
});
