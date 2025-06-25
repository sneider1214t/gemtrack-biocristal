import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./src/config/db.js"; // Asegúrate que el archivo tenga extensión .js
import routerCategorias from "./src/routes/Categorias.routes.js";

app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor backend de Biocristal funcionando correctamente ✅");
});

app.use("/api/categorias", routerCategorias);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
