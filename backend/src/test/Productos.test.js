import request from 'supertest';
import app from '../../index.js';

describe('🧱 API /api/productos - Biocristal', () => {
  const productoNuevo = {
    codigo_producto: 'PROD999',
    nombre_producto: 'Piedra Luna',
    unidad_medida: 'Unidad',
    precio_compra: 8000,
    precio_venta: 16000,
    nombre_ubicacion: 'Bodega1', // debe existir en la tabla Ubicacion
    nit_proveedor: 3001,         // debe existir en la tabla Proveedores
    id_categoria: 'CAT001'       // debe existir en la tabla Categorias
  };

  const productoActualizado = {
    nombre_producto: 'Piedra Lunar',
    unidad_medida: 'Unidad',
    precio_compra: 8500,
    precio_venta: 17000,
    nombre_ubicacion: 'Bodega1',
    nit_proveedor: 3001,
    id_categoria: 'CAT001'
  };

  it('📦 Crear producto', async () => {
    const res = await request(app)
      .post('/api/productos')
      .send(productoNuevo)
      .expect(201); // 201 Created

    console.log('✅ Producto creado:', res.body);
    expect(res.body.codigo_producto).toBe(productoNuevo.codigo_producto);
  });

  it('📋 Obtener todos los productos', async () => {
    const res = await request(app)
      .get('/api/productos')
      .expect(200);

    console.log('📚 Todos los productos:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(p => p.codigo_producto === productoNuevo.codigo_producto)).toBe(true);
  });

  it('🔍 Obtener producto por código', async () => {
    const res = await request(app)
      .get(`/api/productos/${productoNuevo.codigo_producto}`)
      .expect(200);

    console.log('🔎 Producto encontrado:', res.body);
    expect(res.body.codigo_producto).toBe(productoNuevo.codigo_producto);
  });

  it('✏️ Actualizar producto', async () => {
    const res = await request(app)
      .put(`/api/productos/${productoNuevo.codigo_producto}`)
      .send(productoActualizado)
      .expect(200);

    console.log('🛠️ Producto actualizado:', res.body);
    expect(res.body.message).toBe('Producto actualizado correctamente');
  });

  it('🔁 Confirmar producto actualizado', async () => {
    const res = await request(app)
      .get(`/api/productos/${productoNuevo.codigo_producto}`)
      .expect(200);

    console.log('📌 Producto actualizado:', res.body);
    expect(res.body.nombre_producto).toBe(productoActualizado.nombre_producto);
    expect(res.body.nombre_ubicacion).toBe(productoActualizado.nombre_ubicacion);
  });

  it('🗑️ Eliminar producto', async () => {
    const res = await request(app)
      .delete(`/api/productos/${productoNuevo.codigo_producto}`)
      .expect(200);

    console.log('🧹 Producto eliminado:', res.body);
    expect(res.body.message).toBe('Producto eliminado correctamente');
  });

  it('🕳️ Confirmar que producto fue eliminado', async () => {
    const res = await request(app)
      .get(`/api/productos/${productoNuevo.codigo_producto}`)
      .expect(404);

    console.log(`❌ Confirmado: producto con código ${productoNuevo.codigo_producto} fue eliminado`);
    expect(res.body.message).toBe('Producto no encontrado');
  });
});
