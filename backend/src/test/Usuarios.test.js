import request from 'supertest';
import app from '../../index.js';

describe('👤 API /api/usuarios - Biocristal', () => {
  const documentoTest = 1234567890;

  // Usuario sin hashear (la API lo hashea internamente)
  const usuarioNuevo = {
    documento_usuario: documentoTest,
    nombre_usuario: 'Juan Pérez',
    email_usuario: 'juan.perez@example.com',
    rol_usuario: 1,
    contraseña_usuario: 'securepass123' // ⚠️ sin hashear
  };

  const usuarioActualizado = {
    nombre_usuario: 'Juan P. Gómez',
    email_usuario: 'juan.gomez@example.com',
    rol_usuario: 2,
    contraseña_usuario: 'newpass456' // ⚠️ sin hashear
  };

  it('📥 Crear usuario', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send(usuarioNuevo)
      .expect(201);

    console.log('✅ Usuario creado:', res.body);
    expect(res.body.documento_usuario).toBe(usuarioNuevo.documento_usuario);
    expect(res.body.nombre_usuario).toBe(usuarioNuevo.nombre_usuario);
    expect(res.body.email_usuario).toBe(usuarioNuevo.email_usuario);
    expect(res.body.rol_usuario).toBe(usuarioNuevo.rol_usuario);
    expect(typeof res.body.contraseña_usuario).toBe('string'); // Es un hash
  });

  it('📚 Obtener todos los usuarios', async () => {
    const res = await request(app).get('/api/usuarios').expect(200);
    console.log('📋 Lista de usuarios:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('🔎 Obtener usuario por documento', async () => {
    const res = await request(app)
      .get(`/api/usuarios/${usuarioNuevo.documento_usuario}`)
      .expect(200);

    console.log('🔍 Usuario encontrado:', res.body);
    expect(res.body.documento_usuario).toBe(usuarioNuevo.documento_usuario);
  });

  it('✏️ Actualizar usuario', async () => {
    const res = await request(app)
      .put(`/api/usuarios/${usuarioNuevo.documento_usuario}`)
      .send(usuarioActualizado)
      .expect(200);

    console.log('🛠️ Usuario actualizado:', res.body);
    expect(res.body.message).toBe('Usuario actualizado correctamente');
  });

  it('🔁 Confirmar usuario actualizado', async () => {
    const res = await request(app)
      .get(`/api/usuarios/${usuarioNuevo.documento_usuario}`)
      .expect(200);

    console.log('📌 Usuario actualizado:', res.body);
    expect(res.body.nombre_usuario).toBe(usuarioActualizado.nombre_usuario);
    expect(res.body.email_usuario).toBe(usuarioActualizado.email_usuario);
  });

  it('🗑️ Eliminar usuario', async () => {
    const res = await request(app)
      .delete(`/api/usuarios/${usuarioNuevo.documento_usuario}`)
      .expect(200);

    console.log('🧹 Usuario eliminado:', res.body);
    expect(res.body.message).toBe('Usuario eliminado correctamente');
  });

  it('❌ Confirmar eliminación de usuario', async () => {
    const res = await request(app)
      .get(`/api/usuarios/${usuarioNuevo.documento_usuario}`)
      .expect(404);

    console.log(`❌ Confirmado: usuario con documento ${usuarioNuevo.documento_usuario} fue eliminado`);
    expect(res.body.message).toBe('Usuario no encontrado');
  });
});
