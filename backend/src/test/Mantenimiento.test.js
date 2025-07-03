import request from 'supertest';
import app from '../../index.js';

describe('🛠️ API /api/mantenimiento - Biocristal', () => {
  const mantenimientoNuevo = {
    id_mantenimiento: 'MAN001',
    fecha_mantenimiento: '2025-07-02T10:00:00',
    proximo_mantenimiento: '2026-01-01T10:00:00',
    codigo_producto: 'PROD001'
  };

  const mantenimientoActualizado = {
    fecha_mantenimiento: '2025-08-01T12:00:00',
    proximo_mantenimiento: '2026-01-04T10:00:00',
    codigo_producto: 'PROD001'
  };

  it('📦 Crear mantenimiento', async () => {
    const res = await request(app)
      .post('/api/mantenimiento')
      .send(mantenimientoNuevo)
      .expect(201);

    console.log('✅ Mantenimiento creado:', res.body);
    expect(res.body.id_mantenimiento).toBe(mantenimientoNuevo.id_mantenimiento);
  });

  it('📋 Obtener todos los mantenimientos', async () => {
    const res = await request(app)
      .get('/api/mantenimiento')
      .expect(200);

    console.log('📚 Todos los mantenimientos:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('🔍 Obtener mantenimiento por ID', async () => {
    const res = await request(app)
      .get(`/api/mantenimiento/${mantenimientoNuevo.id_mantenimiento}`)
      .expect(200);

    console.log('🔎 Mantenimiento encontrado:', res.body);
    expect(res.body.id_mantenimiento).toBe(mantenimientoNuevo.id_mantenimiento);
  });

  it('✏️ Actualizar mantenimiento', async () => {
    const res = await request(app)
      .put(`/api/mantenimiento/${mantenimientoNuevo.id_mantenimiento}`)
      .send(mantenimientoActualizado)
      .expect(200);

    console.log('🔁 Mantenimiento actualizado:', res.body);
    expect(res.body.message).toBe('Mantenimiento actualizado correctamente');
  });

  it('📌 Confirmar mantenimiento actualizado', async () => {
    const res = await request(app)
      .get(`/api/mantenimiento/${mantenimientoNuevo.id_mantenimiento}`)
      .expect(200);

    console.log('📌 Mantenimiento actualizado:', res.body);
    expect(res.body.proximo_mantenimiento).toBe(mantenimientoActualizado.proximo_mantenimiento);
  });

  it('🗑️ Eliminar mantenimiento', async () => {
    const res = await request(app)
      .delete(`/api/mantenimiento/${mantenimientoNuevo.id_mantenimiento}`)
      .expect(200);

    console.log('🧹 Mantenimiento eliminado:', res.body);
    expect(res.body.message).toBe('Mantenimiento eliminado correctamente');
  });

  it('🚫 Verificar eliminación', async () => {
    await request(app)
      .get(`/api/mantenimiento/${mantenimientoNuevo.id_mantenimiento}`)
      .expect(404);

    console.log(`❌ Confirmado: mantenimiento con ID ${mantenimientoNuevo.id_mantenimiento} fue eliminado`);
  });
});

