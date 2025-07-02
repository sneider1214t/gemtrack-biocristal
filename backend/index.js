import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routerCategorias from "./src/routes/Categorias.routes.js";
import routerClientes from "./src/routes/Clientes.routes.js"; // si lo usas

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor backend de Biocristal funcionando correctamente ✅");
});

app.use("/api/categorias", routerCategorias);
app.use("/api/clientes", routerClientes); // si aplica

// ✅ SOLO iniciar el servidor si NO estás ejecutando los tests
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app;

