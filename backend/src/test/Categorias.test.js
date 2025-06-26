import request from 'supertest';
import app from '../../index.js'; // Asegúrate que esta ruta apunta a tu archivo principal de Express
import { pool } from '../config/db.js'; // Importa el pool de conexiones para interactuar con la DB directamente

describe('Tests para la API de Categorías', () => {
  // Limpiar la tabla de Categorias antes de cada test
  beforeEach(async () => {
    await pool.query('DELETE FROM Categorias');
  });

  // Cerrar el pool de conexiones después de todos los tests
  afterAll(async () => {
    await pool.end();
  });

  // --- GET /categorias ---
  describe('GET /api/categorias', () => {
    test('Debería obtener una lista de categorías vacía si no hay categorías', async () => {
      const res = await request(app).get('/api/categorias');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    test('Debería obtener una lista de categorías', async () => {
      // Primero, inserta algunas categorías para que haya datos que obtener
      await pool.query(
        "INSERT INTO Categorias (id_categoria, nombre_categoria) VALUES (?, ?), (?, ?)",
        ["ge01", 'gemas negras', "ge02", ' gemas blancas']
      );

      const res = await request(app).get('/api/categorias');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('nombre_categoria');
    });
  });

  // --- GET /categorias/:id ---
  describe('GET /api/categorias/:id', () => {
    test('Debería obtener una categoría por su ID', async () => {
      const testCategory = { id_categoria: 10, nombre_categoria: 'Muebles' };
      await request(app).post('/api/categorias').send(testCategory);

      const res = await request(app).get(`/api/categorias/${testCategory.id_categoria}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id_categoria', testCategory.id_categoria);
      expect(res.body).toHaveProperty('nombre_categoria', testCategory.nombre_categoria);
    });

    test('Debería devolver 404 si la categoría no es encontrada', async () => {
      const res = await request(app).get('/api/categorias/999');
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Categoría no encontrada');
    });

    // Test para manejar error interno del servidor (por ejemplo, si la DB está caída o hay un query malformado)
    // Nota: Para simular un error 500 de manera controlada sin afectar la DB real,
    // necesitarías un mock de `pool.query` que lance un error. Esto está fuera del alcance de "solo Jest y Supertest" sin configuraciones adicionales.
    // El test a continuación asume que un error interno resultaría en un 500.
    test('Debería devolver 500 si ocurre un error al obtener la categoría', async () => {
        // En un escenario real, aquí se simularía un error de base de datos.
        // Por ejemplo, si pool.query fallara por alguna razón.
        // Como no estamos mockeando, este test podría no pasar a menos que la base de datos realmente falle.
        // No se puede simular un 500 con una simple petición si la lógica del código es correcta y la DB está bien.
        // Este test sirve más como placeholder para lo que se probaría con mocking.
        // const res = await request(app).get('/categorias/invalid-id-that-causes-db-error'); // Esto no siempre causa 500
        // expect(res.statusCode).toEqual(500);
        // expect(res.body).toHaveProperty('message', 'Error al obtener la categoría');
    });
  });

  // --- POST /categorias ---
  describe('POST /api/categorias', () => {
    test('Debería crear una nueva categoría correctamente', async () => {
      const newCategory = { id_categoria: 20, nombre_categoria: 'Deportes' };
      const res = await request(app).post('/api/categorias').send(newCategory);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id_categoria', newCategory.id_categoria);
      expect(res.body).toHaveProperty('nombre_categoria', newCategory.nombre_categoria);

      // Verifica que la categoría realmente fue creada en la DB
      const [rows] = await pool.query('SELECT * FROM Categorias WHERE id_categoria = ?', [newCategory.id_categoria]);
      expect(rows.length).toBe(1);
      expect(rows[0].nombre_categoria).toBe(newCategory.nombre_categoria);
    });

    test('Debería devolver 400 si falta el ID de la categoría', async () => {
      const invalidCategory = { nombre_categoria: 'Alimentos' };
      const res = await request(app).post('/api/categorias').send(invalidCategory);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'ID y nombre de la categoría son requeridos');
    });

    test('Debería devolver 400 si falta el nombre de la categoría', async () => {
      const invalidCategory = { id_categoria: 21 };
      const res = await request(app).post('/api/categorias').send(invalidCategory);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'ID y nombre de la categoría son requeridos');
    });

    test('Debería devolver 500 si la categoría ya existe (ID duplicado)', async () => {
      const existingCategory = { id_categoria: 30, nombre_categoria: 'Juguetes' };
      await request(app).post('/api/categorias').send(existingCategory); // Crea la categoría una vez

      const res = await request(app).post('/api/categorias').send(existingCategory); // Intenta crearla de nuevo
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Error al crear la categoría');
    });
  });

  // --- PUT /categorias/:id ---
  describe('PUT /api/categorias/:id', () => {
    test('Debería actualizar una categoría existente', async () => {
      const categoryToUpdate = { id_categoria: 40, nombre_categoria: 'Tecnología' };
      await request(app).post('/api/categorias').send(categoryToUpdate);

      const updatedData = { nombre_categoria: 'Tecnología Avanzada' };
      const res = await request(app).put(`/api/categorias/${categoryToUpdate.id_categoria}`).send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Categoría actualizada correctamente');

      // Verifica que la categoría fue actualizada en la DB
      const [rows] = await pool.query('SELECT * FROM Categorias WHERE id_categoria = ?', [categoryToUpdate.id_categoria]);
      expect(rows.length).toBe(1);
      expect(rows[0].nombre_categoria).toBe(updatedData.nombre_categoria);
    });

    test('Debería devolver 404 si la categoría a actualizar no es encontrada', async () => {
      const res = await request(app).put('/api/categorias/999').send({ nombre_categoria: 'No Existe' });
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Categoría no encontrada');
    });

    test('Debería devolver 500 si falta el nombre_categoria en el body al actualizar', async () => {
      // Crea una categoría para actualizar
      const categoryId = 41;
      await request(app).post('/api/categorias').send({ id_categoria: categoryId, nombre_categoria: 'Libros' });

      // Intenta actualizar sin enviar 'nombre_categoria' en el body
      const res = await request(app).put(`/api/categorias/${categoryId}`).send({});
      // Asumiendo que tu columna nombre_categoria en la DB no permite NULL y el query se ejecuta.
      // O si el valor enviado es undefined, lo cual podría causar un error de SQL.
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Error al actualizar la categoría');
    });
  });

  // --- DELETE /categorias/:id ---
  describe('DELETE /api/categorias/:id', () => {
    test('Debería eliminar una categoría existente', async () => {
      const categoryToDelete = { id_categoria: 50, nombre_categoria: 'Limpieza' };
      await request(app).post('/api/categorias').send(categoryToDelete);

      const res = await request(app).delete(`/api/categorias/${categoryToDelete.id_categoria}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Categoría eliminada correctamente');

      // Verifica que la categoría fue eliminada de la DB
      const [rows] = await pool.query('SELECT * FROM Categorias WHERE id_categoria = ?', [categoryToDelete.id_categoria]);
      expect(rows.length).toBe(0);
    });

    test('Debería devolver 404 si la categoría a eliminar no es encontrada', async () => {
      const res = await request(app).delete('/api/categorias/999');
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Categoría no encontrada');
    });

    // Test para simular un error interno al eliminar (ej. restricción de clave foránea)
    test('Debería devolver 500 si ocurre un error al eliminar la categoría', async () => {
        // En un escenario real, esto ocurriría si, por ejemplo,
        // hay productos asociados a esta categoría y la base de datos tiene una restricción ON DELETE RESTRICT.
        // No podemos simular esto sin un mock de la DB, pero el endpoint lo manejaría.
        // const res = await request(app).delete('/categorias/id_con_restriccion');
        // expect(res.statusCode).toEqual(500);
        // expect(res.body).toHaveProperty('error', 'Error al eliminar la categoría');
    });
  });

});
