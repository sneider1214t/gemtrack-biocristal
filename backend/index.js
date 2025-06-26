import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routerCategorias from "./src/routes/Categorias.routes.js";

// Cargar variables de entorno desde .env
dotenv.config();

// Crear instancia de express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor backend de Biocristal funcionando correctamente ✅");
});

// Rutas de la API
app.use("/api/categorias", routerCategorias);

// Puerto desde .env o por defecto 5000
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
