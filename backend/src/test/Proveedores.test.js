import request from 'supertest';
import app from '../../index.js';

describe('🧱 API /api/proveedores - Biocristal', () => {
  const proveedorNuevo = {
    nit_proveedor: 9999,
    nombre_proveedor: 'Proveedor Test',
    direccion_proveedor: 'Calle 123',
    email_proveedor: 'proveedor@test.com',
  };

  const proveedorActualizado = {
    nombre_proveedor: 'Proveedor Modificado',
    direccion_proveedor: 'Carrera 45',
    email_proveedor: 'nuevo@email.com',
  };

  it('📦 Crear proveedor', async () => {
    const res = await request(app)
      .post('/api/proveedores')
      .send(proveedorNuevo)
      .expect(201);

    console.log('✅ Proveedor creado:', res.body);
    expect(res.body.nit_proveedor).toBe(proveedorNuevo.nit_proveedor);
  });

  it('📋 Obtener todos los proveedores', async () => {
    const res = await request(app)
      .get('/api/proveedores')
      .expect(200);

    console.log('📚 Lista de proveedores:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(p => p.nit_proveedor === proveedorNuevo.nit_proveedor)).toBe(true);
  });

  it('🔍 Obtener proveedor por NIT', async () => {
    const res = await request(app)
      .get(`/api/proveedores/${proveedorNuevo.nit_proveedor}`)
      .expect(200);

    console.log('🔎 Proveedor encontrado:', res.body);
    expect(res.body.nit_proveedor).toBe(proveedorNuevo.nit_proveedor);
  });

  it('✏️ Actualizar proveedor', async () => {
    const res = await request(app)
      .put(`/api/proveedores/${proveedorNuevo.nit_proveedor}`)
      .send(proveedorActualizado)
      .expect(200);

    console.log('🛠️ Proveedor actualizado:', res.body);
    expect(res.body.message).toBe('Proveedor actualizado correctamente');
  });

  it('🔁 Confirmar proveedor actualizado', async () => {
    const res = await request(app)
      .get(`/api/proveedores/${proveedorNuevo.nit_proveedor}`)
      .expect(200);

    console.log('📌 Proveedor actualizado:', res.body);
    expect(res.body.nombre_proveedor).toBe(proveedorActualizado.nombre_proveedor);
    expect(res.body.direccion_proveedor).toBe(proveedorActualizado.direccion_proveedor);
    expect(res.body.email_proveedor).toBe(proveedorActualizado.email_proveedor);
  });

  it('🗑️ Eliminar proveedor', async () => {
    const res = await request(app)
      .delete(`/api/proveedores/${proveedorNuevo.nit_proveedor}`)
      .expect(200);

    console.log('🧹 Proveedor eliminado:', res.body);
    expect(res.body.message).toBe('Proveedor eliminado correctamente');
  });

  it('🕳️ Confirmar que proveedor fue eliminado', async () => {
    const res = await request(app)
      .get(`/api/proveedores/${proveedorNuevo.nit_proveedor}`)
      .expect(404);

    console.log(`❌ Confirmado: proveedor con NIT ${proveedorNuevo.nit_proveedor} fue eliminado`);
    expect(res.body.message).toBe('Proveedor no encontrado');
  });
});
