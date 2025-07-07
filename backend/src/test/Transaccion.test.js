// src/test/Transaccion.test.js
import request from 'supertest';
import app from '../../index.js'; // ✅ Importa tu app correctamente

describe('🧾 API /api/transaccion - Biocristal', () => {
  const transaccionNueva = {
    codigo_transaccion: 'TRANS999',
    fecha_transaccion: '2025-07-03',
    tipo_transaccion: 1,
    ingreso_caja: 50000,
    egreso_caja: 0,
    documento_usuario: 1001 // Asegúrate que este documento exista en tu tabla Usuario
  };

  const transaccionActualizada = {
    fecha_transaccion: '2025-07-04',
    tipo_transaccion: 2,
    ingreso_caja: 0,
    egreso_caja: 45000,
    documento_usuario: 1001
  };

  // 📦 Crear una transacción
  it('📦 Crear transacción', async () => {
    const res = await request(app)
      .post('/api/transaccion')
      .send(transaccionNueva)
      .expect(201);

    console.log('✅ Transacción creada:', res.body);
    expect(res.body.codigo_transaccion).toBe(transaccionNueva.codigo_transaccion);
  });

  // 📋 Obtener todas las transacciones
  it('📋 Obtener todas las transacciones', async () => {
    const res = await request(app)
      .get('/api/transaccion')
      .expect(200);

    console.log('📚 Todas las transacciones:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 🔍 Obtener transacción por código
  it('🔍 Obtener transacción por código', async () => {
    const res = await request(app)
      .get(`/api/transaccion/${transaccionNueva.codigo_transaccion}`)
      .expect(200);

    console.log('🔎 Transacción encontrada:', res.body);
    expect(res.body.codigo_transaccion).toBe(transaccionNueva.codigo_transaccion);
  });

  // ✏️ Actualizar transacción
  it('✏️ Actualizar transacción', async () => {
    const res = await request(app)
      .put(`/api/transaccion/${transaccionNueva.codigo_transaccion}`)
      .send(transaccionActualizada)
      .expect(200);

    console.log('🛠️ Transacción actualizada:', res.body);
    expect(res.body.message).toBe('Transacción actualizada correctamente');
  });

  // 🔁 Confirmar actualización
  it('🔁 Confirmar transacción actualizada', async () => {
    const res = await request(app)
      .get(`/api/transaccion/${transaccionNueva.codigo_transaccion}`)
      .expect(200);

    console.log('📌 Transacción actualizada:', res.body);
    expect(res.body.tipo_transaccion).toBe(transaccionActualizada.tipo_transaccion);
    expect(res.body.egreso_caja).toBe(transaccionActualizada.egreso_caja);
  });

  // 🗑️ Eliminar transacción
  it('🗑️ Eliminar transacción', async () => {
    const res = await request(app)
      .delete(`/api/transaccion/${transaccionNueva.codigo_transaccion}`)
      .expect(200);

    console.log('🧹 Transacción eliminada:', res.body);
    expect(res.body.message).toBe('Transacción eliminada correctamente');
  });

  // ❌ Confirmar eliminación
  it('❌ Confirmar transacción eliminada', async () => {
    const res = await request(app)
      .get(`/api/transaccion/${transaccionNueva.codigo_transaccion}`)
      .expect(404);

    console.log(`❌ Confirmado: transacción con código ${transaccionNueva.codigo_transaccion} fue eliminada`);
  });
});
