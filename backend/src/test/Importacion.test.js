import request from 'supertest';
import app from '../../index.js';

describe('📦 API /api/importacion - Biocristal', () => {
  const importacionNueva = {
    id_importacion: 'IMP001',
    fecha_importacion: '2025-07-03 10:00:00',
    sistema_origen: 'Sistema X',
    documento_usuario: 1001 // ya insertado
  };

  const importacionActualizada = {
    fecha_importacion: '2025-07-04 12:00:00',
    sistema_origen: 'Sistema Y',
    documento_usuario: 1001
  };

  it('📥 Crear importación', async () => {
    const res = await request(app)
      .post('/api/importacion')
      .send(importacionNueva)
      .expect(201);

    console.log('✅ Importación creada:', res.body);
    expect(res.body.id_importacion).toBe(importacionNueva.id_importacion);
  });

  it('📋 Obtener todas las importaciones', async () => {
    const res = await request(app)
      .get('/api/importacion')
      .expect(200);

    console.log('📚 Todas las importaciones:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('🔍 Obtener importación por ID', async () => {
    const res = await request(app)
      .get(`/api/importacion/${importacionNueva.id_importacion}`)
      .expect(200);

    console.log('🔎 Importación encontrada:', res.body);
    expect(res.body.id_importacion).toBe(importacionNueva.id_importacion);
  });

  it('✏️ Actualizar importación', async () => {
    const res = await request(app)
      .put(`/api/importacion/${importacionNueva.id_importacion}`)
      .send(importacionActualizada)
      .expect(200);

    console.log('🛠️ Importación actualizada:', res.body);
    expect(res.body.message).toBe('Importación actualizada correctamente');
  });

  it('🔁 Confirmar importación actualizada', async () => {
    const res = await request(app)
      .get(`/api/importacion/${importacionNueva.id_importacion}`)
      .expect(200);

    console.log('📌 Importación actualizada:', res.body);
    expect(res.body.sistema_origen).toBe(importacionActualizada.sistema_origen);
  });

  it('🗑️ Eliminar importación', async () => {
    const res = await request(app)
      .delete(`/api/importacion/${importacionNueva.id_importacion}`)
      .expect(200);

    console.log('🧹 Importación eliminada:', res.body);
    expect(res.body.message).toBe('Importación eliminada correctamente');
  });

  it('🚫 Verificar eliminación', async () => {
    await request(app)
      .get(`/api/importacion/${importacionNueva.id_importacion}`)
      .expect(404);

    console.log(`❌ Confirmado: importación con ID ${importacionNueva.id_importacion} fue eliminada`);
  });
});
