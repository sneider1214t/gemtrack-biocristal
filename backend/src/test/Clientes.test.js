import request from 'supertest';
import app from '../../index.js'; // ✅ Importamos directamente la app desde index.js

describe('👤 API /api/clientes - Biocristal', () => {
  const clienteNuevo = {
    documento_cliente: 1234567890,
    nombre_cliente: 'Juan Pérez',
    email: 'juan.perez@example.com',
    telefono: 3123456789
  };

  const clienteActualizado = {
    nombre_cliente: 'Juan David Pérez',
    email: 'juan.david@example.com',
    telefono: 3009876543
  };

  it('📦 Crear cliente', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .send(clienteNuevo)
      .expect(201);

    console.log('✅ Cliente creado:', res.body);
    expect(res.body.documento_cliente).toBe(clienteNuevo.documento_cliente);
  });

  it('📋 Obtener todos los clientes', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .expect(200);

    console.log('📚 Todos los clientes:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('🔍 Obtener cliente por documento', async () => {
    const res = await request(app)
      .get(`/api/clientes/${clienteNuevo.documento_cliente}`)
      .expect(200);

    console.log('🔎 Cliente por documento:', res.body);
    expect(res.body.documento_cliente).toBe(clienteNuevo.documento_cliente);
  });

  it('✏️ Actualizar cliente', async () => {
    const res = await request(app)
      .put(`/api/clientes/${clienteNuevo.documento_cliente}`)
      .send(clienteActualizado)
      .expect(200);

    console.log('🛠️ Cliente actualizado:', res.body);
    expect(res.body.message).toBe('Cliente actualizado correctamente');
  });

  it('🔁 Confirmar cliente actualizado', async () => {
    const res = await request(app)
      .get(`/api/clientes/${clienteNuevo.documento_cliente}`)
      .expect(200);

    console.log('📌 Cliente actualizado:', res.body);
    expect(res.body.nombre_cliente).toBe(clienteActualizado.nombre_cliente);
  });

  it('🗑️ Eliminar cliente', async () => {
    const res = await request(app)
      .delete(`/api/clientes/${clienteNuevo.documento_cliente}`)
      .expect(200);

    console.log('🧹 Cliente eliminado:', res.body);
    expect(res.body.message).toBe('Cliente eliminado correctamente');
  });

  it('🚫 Verificar eliminación', async () => {
    await request(app)
      .get(`/api/clientes/${clienteNuevo.documento_cliente}`)
      .expect(404);

    console.log(`❌ Confirmado: cliente con documento ${clienteNuevo.documento_cliente} fue eliminado`);
  });
});
