import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import routerCategorias from "./src/routes/Categorias.routes.js";
import routerClientes from "./src/routes/Clientes.routes.js"; 
import routerDevolucion from "./src/routes/Devolucion.routes.js";
import routerExportacion from "./src/routes/Exportacion.routes.js";
import routerFactura from "./src/routes/Factura.routes.js";
import routerImportacion from "./src/routes/Importacion.routes.js";
import routerMantenimiento from "./src/routes/Mantenimiento.routes.js";
import routerProductos from "./src/routes/Productos.routes.js";
import routerProveedores from "./src/routes/Proveedores.routes.js";
import routerTransaccion from "./src/routes/Transaccion.routes.js";
import routerUbicacion from "./src/routes/Ubicacion.routes.js";
import routerUsuarios from "./src/routes/Usuarios.routes.js";

dotenv.config();

const app = express();

// 📌 Necesario para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// 📂 Servir imágenes de la carpeta "uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Servidor backend de Biocristal funcionando correctamente ✅");
});

app.use("/api/categorias", routerCategorias);
app.use("/api/clientes", routerClientes);
app.use("/api/devolucion", routerDevolucion);
app.use("/api/exportacion", routerExportacion);
app.use("/api/factura", routerFactura);
app.use("/api/importacion", routerImportacion);
app.use("/api/mantenimiento", routerMantenimiento);
app.use("/api/productos", routerProductos);
app.use("/api/proveedores", routerProveedores);
app.use("/api/transaccion", routerTransaccion);
app.use("/api/ubicacion", routerUbicacion);
app.use("/api/usuarios", routerUsuarios);

// ✅ SOLO iniciar el servidor si NO estás ejecutando los tests
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app;
