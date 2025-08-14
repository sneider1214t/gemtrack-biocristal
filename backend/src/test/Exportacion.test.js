import request from 'supertest';
import app from '../../index.js';

describe('🚚 API /api/exportacion - Biocristal', () => {
  const exportacionNueva = {
    id_exportacion: 'EXP001',
    fecha_exportacion: '2025-07-02T10:00:00',
    sistema_destino: 'SAP',
    documento_usuario: 1001
  };

  const exportacionActualizada = {
    fecha_exportacion: '2025-07-03T12:00:00',
    sistema_destino: 'ORACLE',
    documento_usuario: 1001
  };

  it('📦 Crear exportación', async () => {
    const res = await request(app)
      .post('/api/exportacion')
      .send(exportacionNueva)
      .expect(201);

    console.log('✅ Exportación creada:', res.body);
    expect(res.body.id_exportacion).toBe(exportacionNueva.id_exportacion);
  });

  it('📋 Obtener todas las exportaciones', async () => {
    const res = await request(app)
      .get('/api/exportacion')
      .expect(200);

    console.log('📚 Todas las exportaciones:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('🔍 Obtener exportación por ID', async () => {
    const res = await request(app)
      .get(`/api/exportacion/${exportacionNueva.id_exportacion}`)
      .expect(200);

    console.log('🔎 Exportación encontrada:', res.body);
    expect(res.body.id_exportacion).toBe(exportacionNueva.id_exportacion);
  });

  it('✏️ Actualizar exportación', async () => {
    const res = await request(app)
      .put(`/api/exportacion/${exportacionNueva.id_exportacion}`)
      .send(exportacionActualizada)
      .expect(200);

    console.log('🛠️ Exportación actualizada:', res.body);
    expect(res.body.message).toBe('Exportación actualizada correctamente');
  });

  it('🔁 Confirmar exportación actualizada', async () => {
    const res = await request(app)
      .get(`/api/exportacion/${exportacionNueva.id_exportacion}`)
      .expect(200);

    console.log('📌 Exportación actualizada:', res.body);
    expect(res.body.sistema_destino).toBe(exportacionActualizada.sistema_destino);
  });

  it('🗑️ Eliminar exportación', async () => {
    const res = await request(app)
      .delete(`/api/exportacion/${exportacionNueva.id_exportacion}`)
      .expect(200);

    console.log('🧹 Exportación eliminada:', res.body);
    expect(res.body.message).toBe('Exportación eliminada correctamente');
  });

  it('🚫 Verificar eliminación', async () => {
    await request(app)
      .get(`/api/exportacion/${exportacionNueva.id_exportacion}`)
      .expect(404);

    console.log(`❌ Confirmado: exportación con ID ${exportacionNueva.id_exportacion} fue eliminada`);
  });
});
