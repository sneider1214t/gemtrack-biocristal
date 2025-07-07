import request from 'supertest';
import app from '../../index.js'; // ✅ Asegúrate de importar tu app correctamente

describe('🔧 API /api/mantenimiento - Biocristal', () => {
  const mantenimientoNuevo = {
    id_mantenimiento: 'MT001',
    fecha_mantenimiento: '2025-12-01 10:00:00',
    proximo_mantenimiento: '2026-01-04 10:00:00',
    codigo_producto: 'PROD001' // Asegúrate de que este producto exista
  };

  const mantenimientoActualizado = {
    fecha_mantenimiento: '2025-12-02 11:00:00',
    proximo_mantenimiento: '2026-01-05 11:00:00',
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

    console.log('🛠️ Mantenimiento actualizado:', res.body);
    expect(res.body.message).toBe('Mantenimiento actualizado correctamente');
  });

  it('📌 Confirmar mantenimiento actualizado', async () => {
  const res = await request(app)
      .get(`/api/mantenimiento/${mantenimientoNuevo.id_mantenimiento}`)
      .expect(200);

    console.log('📌 Mantenimiento actualizado:', res.body);
    const recibido = new Date(res.body.proximo_mantenimiento).toISOString().replace('T', ' ').slice(0, 19);
    const esperado = new Date(mantenimientoActualizado.proximo_mantenimiento).toISOString().replace('T', ' ').slice(0, 19);
    expect(recibido).toBe(esperado); // ✅
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
