import request from 'supertest';
import app from '../../index.js';

describe('🧾 API /api/factura - Biocristal', () => {
  const facturaNueva = {
    codigo_factura: 'FAC002',
    fecha_factura: '2025-07-02 14:00:00',
    tipo_pago: 1,
    total_factura: 120000,
    codigo_transaccion: 'TRANS001',  // Ya insertada en tu base de datos
    documento_cliente: 2001          // Ya insertado también
  };

  const facturaActualizada = {
    fecha_factura: '2025-07-03 10:30:00',
    tipo_pago: 0,
    total_factura: 135000,
    codigo_transaccion: 'TRANS001',
    documento_cliente: 2001
  };

  it('📦 Crear factura', async () => {
    const res = await request(app)
      .post('/api/factura')
      .send(facturaNueva)
      .expect(201);

    console.log('✅ Factura creada:', res.body);
    expect(res.body.codigo_factura).toBe(facturaNueva.codigo_factura);
  });

  it('📋 Obtener todas las facturas', async () => {
    const res = await request(app)
      .get('/api/factura')
      .expect(200);

    console.log('📚 Todas las facturas:', res.body);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('🔍 Obtener factura por código', async () => {
    const res = await request(app)
      .get(`/api/factura/${facturaNueva.codigo_factura}`)
      .expect(200);

    console.log('🔎 Factura encontrada:', res.body);
    expect(res.body.codigo_factura).toBe(facturaNueva.codigo_factura);
  });

  it('✏️ Actualizar factura', async () => {
    const res = await request(app)
      .put(`/api/factura/${facturaNueva.codigo_factura}`)
      .send(facturaActualizada)
      .expect(200);

    console.log('🛠️ Factura actualizada:', res.body);
    expect(res.body.message).toBe('Factura actualizada correctamente');
  });

  it('🔁 Confirmar factura actualizada', async () => {
    const res = await request(app)
      .get(`/api/factura/${facturaNueva.codigo_factura}`)
      .expect(200);

    console.log('📌 Factura actualizada:', res.body);
    expect(res.body.total_factura).toBe(facturaActualizada.total_factura);
  });

  it('🗑️ Eliminar factura', async () => {
    const res = await request(app)
      .delete(`/api/factura/${facturaNueva.codigo_factura}`)
      .expect(200);

    console.log('🧹 Factura eliminada:', res.body);
    expect(res.body.message).toBe('Factura eliminada correctamente');
  });

  it('🚫 Verificar eliminación', async () => {
    await request(app)
      .get(`/api/factura/${facturaNueva.codigo_factura}`)
      .expect(404);

    console.log(`❌ Confirmado: factura con código ${facturaNueva.codigo_factura} fue eliminada`);
  });
});
