// src/components/OrdenesCompra.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  X,
  Package,
  Clock,
  Truck,
  AlertTriangle,
} from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:3000/api/productos",
  headers: { "Content-Type": "application/json" },
});

// Asigna un estado “estable” por producto según su código/nombre
function statusFromProduct(p) {
  const code = String(p?.codigo_producto || p?.nombre_producto || "");
  let sum = 0;
  for (let i = 0; i < code.length; i++) sum = (sum + code.charCodeAt(i)) % 997;
  return sum % 2 === 0 ? "Pendiente" : "En pedido";
}

export default function OrdenesCompra() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pendiente | enPedido

  // Inyectar token si existe
  useEffect(() => {
    const token = localStorage.getItem("token");
    const interceptor = api.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, []);

  // Cargar productos
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/");
        setProductos(Array.isArray(data) ? data : []);
        setErr("");
      } catch (e) {
        console.error(e);
        setErr(
          e?.response?.data?.message ||
            e?.response?.data?.error ||
            "Error al obtener productos"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Enriquecer con estado
  const productosConEstado = useMemo(
    () =>
      productos.map((p) => ({
        ...p,
        _estado: statusFromProduct(p), // "Pendiente" | "En pedido"
      })),
    [productos]
  );

  // Filtro por búsqueda y estado
  const filtrados = useMemo(() => {
    const q = (search || "").toLowerCase();
    return productosConEstado.filter((p) => {
      const matchQ =
        String(p.nombre_producto || "").toLowerCase().includes(q) ||
        String(p.codigo_producto || "").toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "pendiente"
          ? p._estado === "Pendiente"
          : p._estado === "En pedido";
      return matchQ && matchStatus;
    });
  }, [productosConEstado, search, statusFilter]);

  if (loading) {
    return (
      <div className="p-8 text-white">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent"></div>
          <span>Cargando órdenes de compra...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-white">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-accent">Órdenes de compra</h2>
        <p className="text-gray-300 mt-1">
          Aquí verás las compras automáticas cuando se generen. Por ahora
          mostramos todos los productos con un estado simulado para visualizar
          el flujo.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-3 text-muted" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o nombre…"
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-card text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent border border-gray-700"
          />
          {search && (
            <button
              className="absolute right-2 top-2 text-muted hover:text-white"
              onClick={() => setSearch("")}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-300">Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-gray-700 rounded-xl px-3 py-2"
          >
            <option value="all">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="enPedido">En pedido</option>
          </select>
        </div>
      </div>

      {err && (
        <div className="mb-6 p-4 bg-red-900/40 border border-red-700 rounded-lg flex items-center gap-2">
          <AlertTriangle />
          <span>{err}</span>
        </div>
      )}

      {/* Cards */}
      {filtrados.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtrados.map((p) => {
            const img =
              p.imagen_producto
                ? `http://localhost:3000/api/productos/images/${p.imagen_producto}`
                : "/gemtrack-biocristal/img/zafiro.png";

            const chip =
              p._estado === "Pendiente" ? (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                  Pendiente
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  En pedido
                </span>
              );

            return (
              <div
                key={p.codigo_producto}
                className="bg-card border border-gray-700 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={img}
                      alt={p.nombre_producto}
                      className="w-16 h-16 object-cover rounded-xl border border-gray-700"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {p.nombre_producto}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Código: {p.codigo_producto}
                      </p>
                    </div>
                  </div>
                  {chip}
                </div>

                {/* Body */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Package size={16} className="text-accent" />
                    <span>
                      Stock:{" "}
                      <span className="font-semibold text-white">
                        {p.stock}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock size={16} className="text-accent" />
                    <span>Unidad: {p.unidad_medida}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Truck size={16} className="text-accent" />
                    <span>Proveedor: {p.nit_proveedor}</span>
                  </div>
                  <div className="text-gray-300">
                    Ubicación: {p.nombre_ubicacion}
                  </div>
                  <div className="text-gray-300 col-span-2">
                    Precio compra:{" "}
                    <span className="text-white font-semibold">
                      ${Number(p.precio_compra || 0).toLocaleString()}
                    </span>{" "}
                    · Precio venta:{" "}
                    <span className="text-white font-semibold">
                      ${Number(p.precio_venta || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Footer (acciones deshabilitadas por ser diseño) */}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 cursor-not-allowed"
                    title="Próximamente"
                    disabled
                  >
                    Ver orden
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg bg-gray-700/50 text-gray-300 cursor-not-allowed"
                    title="Próximamente"
                    disabled
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 border border-dashed border-gray-700 rounded-xl text-center text-gray-400">
          No hay productos para mostrar.
        </div>
      )}
    </div>
  );
}

