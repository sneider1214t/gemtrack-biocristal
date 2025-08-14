import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/productos",
  headers: { "Content-Type": "application/json" },
});

function NivelesStock() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/");
      // Nos quedamos solo con las propiedades que queremos mostrar
      const productosFiltrados = data.map((p) => ({
        codigo_producto: p.codigo_producto,
        nombre_producto: p.nombre_producto,
        stock: p.stock,
      }));
      setProductos(productosFiltrados);
      setError("");
    } catch (err) {
      console.error("Error al obtener productos:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al obtener los productos"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 text-white">
        <p className="text-lg">Cargando niveles de stock...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6">Niveles de Stock</h2>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {productos.length > 0 ? (
          productos.map((p) => (
            <div
              key={p.codigo_producto}
              className="bg-card p-4 rounded-xl shadow-xl flex justify-between"
            >
              <span className="font-semibold">{p.codigo_producto} - {p.nombre_producto}</span>
              <span
                className={`font-bold ${
                  p.stock > 20
                    ? "text-green-400"
                    : p.stock > 0
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {p.stock} disponibles
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No hay productos registrados.</p>
        )}
      </div>
    </div>
  );
}

export default NivelesStock;

