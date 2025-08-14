import request from 'supertest';
import app from '../../index.js'; 

describe('📍 API /api/ubicacion - Biocristal', () => {
  const ubicacionNueva = {
    nombre_ubicacion: 'BodegaTest',
    estado_ubicacion: 'Ocupada' // texto permitido
  };

  const ubicacionActualizada = {
    estado_ubicacion: 'Con espacio' // Texto permitido
  };

  // 📦 Crear ubicación
  it('📦 Crear ubicación', async () => {
    const res = await request(app)
      .post('/api/ubicacion')
      .send(ubicacionNueva)
      .expect(201);

    console.log('✅ Ubicación creada:', res.body);
    expect(res.body.nombre_ubicacion).toBe(ubicacionNueva.nombre_ubicacion);
    expect(res.body.estado_ubicacion).toBe('Ocupada');
  });

  // 📋 Obtener todas las ubicaciones
  it('📋 Obtener todas las ubicaciones', async () => {
    const res = await request(app)
      .get('/api/ubicacion')
      .expect(200);

    console.log('📚 Todas las ubicaciones:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(u => u.estado_ubicacion === 'Ocupada' || u.estado_ubicacion === 'Con espacio')).toBe(true);
  });

  // 🔍 Obtener ubicación por nombre
  it('🔍 Obtener ubicación por nombre', async () => {
    const res = await request(app)
      .get(`/api/ubicacion/${ubicacionNueva.nombre_ubicacion}`)
      .expect(200);

    console.log('🔎 Ubicación encontrada:', res.body);
    expect(res.body.nombre_ubicacion).toBe(ubicacionNueva.nombre_ubicacion);
    expect(res.body.estado_ubicacion).toBe('Ocupada');
  });

  // ✏️ Actualizar ubicación
  it('✏️ Actualizar ubicación', async () => {
    const res = await request(app)
      .put(`/api/ubicacion/${ubicacionNueva.nombre_ubicacion}`)
      .send(ubicacionActualizada)
      .expect(200);

    console.log('🛠️ Ubicación actualizada:', res.body);
    expect(res.body.message).toBe('Ubicación actualizada correctamente');
  });

  // 🔁 Confirmar actualización
  it('🔁 Confirmar ubicación actualizada', async () => {
    const res = await request(app)
      .get(`/api/ubicacion/${ubicacionNueva.nombre_ubicacion}`)
      .expect(200);

    console.log('📌 Ubicación actualizada:', res.body);
    expect(res.body.estado_ubicacion).toBe('Con espacio');
  });

  // 🗑️ Eliminar ubicación
  it('🗑️ Eliminar ubicación', async () => {
    const res = await request(app)
      .delete(`/api/ubicacion/${ubicacionNueva.nombre_ubicacion}`)
      .expect(200);

    console.log('🧹 Ubicación eliminada:', res.body);
    expect(res.body.message).toBe('Ubicación eliminada correctamente');
  });

  // ❌ Confirmar eliminación
  it('❌ Confirmar ubicación eliminada', async () => {
    await request(app)
      .get(`/api/ubicacion/${ubicacionNueva.nombre_ubicacion}`)
      .expect(404);

    console.log(`❌ Confirmado: ubicación ${ubicacionNueva.nombre_ubicacion} fue eliminada`);
  });
});
