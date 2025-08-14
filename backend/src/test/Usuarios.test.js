import request from 'supertest';
import mysql from 'mysql2/promise';
import app from '../../index.js';

describe('👤 API /api/usuarios - Biocristal', () => {
  const documentoTest = 1234567890;

  const usuarioNuevo = {
    documento_usuario: documentoTest,
    nombre_usuario: 'Juan Pérez',
    email_usuario: 'juan.perez@example.com',
    rol_usuario: 'Administrador', 
    contraseña_usuario: 'securepass123'
  };

  const usuarioActualizado = {
    nombre_usuario: 'Juan P. Gómez',
    email_usuario: 'juan.gomez@example.com',
    rol_usuario: 'Empleado', 
    contraseña_usuario: 'newpass456'
  };

  it('📥 Crear usuario', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send(usuarioNuevo)
      .expect(201);

    console.log('✅ Usuario creado:', res.body);
    expect(res.body.documento_usuario).toBe(usuarioNuevo.documento_usuario);
  });

  it('📋 Obtener todos los usuarios', async () => {
    const res = await request(app).get('/api/usuarios').expect(200);
    console.log('📚 Todos los usuarios:', res.body);
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
  });

  /* ---------------- Recuperación de contraseña ---------------- */
  let resetToken = '';

  it('📧 Solicitar recuperación de contraseña', async () => {
    const res = await request(app)
      .post('/api/usuarios/forgot-password')
      .send({ email_usuario: usuarioActualizado.email_usuario })
      .expect(200);

    console.log('📩 Respuesta forgot-password:', res.body);
    expect(res.body.message).toContain('enlace de recuperación');

    // 📌 Crear conexión directa SOLO para leer el token
    const pool = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await pool.query(
      'SELECT reset_token FROM usuarios WHERE email_usuario = ?',
      [usuarioActualizado.email_usuario]
    );

    resetToken = rows[0]?.reset_token;
    await pool.end();

    console.log('🔑 Token generado en BD:', resetToken);
    expect(resetToken).toBeTruthy();
  });

  it('🔓 Cambiar contraseña con token válido', async () => {
    const res = await request(app)
      .post(`/api/usuarios/reset-password/${resetToken}`)
      .send({ nueva_contraseña: 'passwordNueva123' })
      .expect(200);

    console.log('✅ Respuesta reset-password:', res.body);
    expect(res.body.message).toBe('Contraseña actualizada correctamente');
  });

  it('🚫 Reuso de token (ya utilizado)', async () => {
    const res = await request(app)
      .post(`/api/usuarios/reset-password/${resetToken}`)
      .send({ nueva_contraseña: 'passwordNueva123' })
      .expect(400);

    console.log('❌ Reuso de token:', res.body);
    expect(res.body.message).toContain('Token inválido o expirado');
  });

  /* ---------------- Eliminar usuario ---------------- */
  it('🗑️ Eliminar usuario', async () => {
    const res = await request(app)
      .delete(`/api/usuarios/${usuarioNuevo.documento_usuario}`)
      .expect(200);

    console.log('🧹 Usuario eliminado:', res.body);
    expect(res.body.message).toBe('Usuario eliminado correctamente');
  });

  it('❌ Confirmar eliminación de usuario', async () => {
    await request(app)
      .get(`/api/usuarios/${usuarioNuevo.documento_usuario}`)
      .expect(404);

    console.log(`❌ Confirmado: usuario con documento ${usuarioNuevo.documento_usuario} fue eliminado`);
  });
});
