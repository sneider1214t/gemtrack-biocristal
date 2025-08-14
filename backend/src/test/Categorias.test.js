import request from 'supertest';
import app from '../../index.js'; // ✅ Importamos directamente la app desde index.js

describe('🔷 API /api/categorias - Biocristal', () => {
  const categoriaNueva = {
    id_categoria: 'CAT002',
    nombre_categoria: 'Cuarzos rojos'
  };

  const categoriaActualizada = {
    nombre_categoria: 'Cuarzos Naturales'
  };

  it('📦 Crear categoría', async () => {
    const res = await request(app)
      .post('/api/categorias')
      .send(categoriaNueva)
      .expect(201);

    console.log('✅ Categoría creada:', res.body);
    expect(res.body.id_categoria).toBe(categoriaNueva.id_categoria);
  });

  it('📋 Obtener todas las categorías', async () => {
    const res = await request(app)
      .get('/api/categorias')
      .expect(200);

    console.log('📚 Todas las categorías:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('🔍 Obtener categoría por ID', async () => {
    const res = await request(app)
      .get(`/api/categorias/${categoriaNueva.id_categoria}`)
      .expect(200);

    console.log('🔎 Categoría por ID:', res.body);
    expect(res.body.id_categoria).toBe(categoriaNueva.id_categoria);
  });

  it('✏️ Actualizar categoría', async () => {
    const res = await request(app)
      .put(`/api/categorias/${categoriaNueva.id_categoria}`)
      .send(categoriaActualizada)
      .expect(200);

    console.log('🛠️ Categoría actualizada:', res.body);
    expect(res.body.message).toBe('Categoría actualizada correctamente');
  });

  it('🔁 Confirmar categoría actualizada', async () => {
    const res = await request(app)
      .get(`/api/categorias/${categoriaNueva.id_categoria}`)
      .expect(200);

    console.log('📌 Categoría actualizada:', res.body);
    expect(res.body.nombre_categoria).toBe(categoriaActualizada.nombre_categoria);
  });

  it('🗑️ Eliminar categoría', async () => {
    const res = await request(app)
      .delete(`/api/categorias/${categoriaNueva.id_categoria}`)
      .expect(200);

    console.log('🧹 Categoría eliminada:', res.body);
    expect(res.body.message).toBe('Categoría eliminada correctamente');
  });

  it('🚫 Verificar eliminación', async () => {
    await request(app)
      .get(`/api/categorias/${categoriaNueva.id_categoria}`)
      .expect(404);

    console.log(`❌ Confirmado: categoría con ID ${categoriaNueva.id_categoria} fue eliminada`);
  });
});


