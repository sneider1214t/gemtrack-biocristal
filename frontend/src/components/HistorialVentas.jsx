// src/components/HistorialVentas.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Calendar, DollarSign, AlertTriangle, Eye, EyeOff, Clipboard } from "lucide-react";

const FACTURAS_URL = "http://localhost:3000/api/factura";

function HistorialVentas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [expanded, setExpanded] = useState(() => new Set()); // filas expandidas por codigo_factura

  // Axios + token
  const facturasApi = axios.create({ baseURL: FACTURAS_URL });
  useEffect(() => {
    const token = localStorage.getItem("token");
    const i = facturasApi.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => facturasApi.interceptors.request.eject(i);
  }, []);

  // Fetch
  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        setLoading(true);
        const { data } = await facturasApi.get("/");
        setFacturas(Array.isArray(data) ? data : []);
        setErr("");
      } catch (e) {
        console.error("Error cargando facturas:", e);
        setErr(
          e?.response?.data?.message ||
            e?.response?.data?.error ||
            "Error al obtener las facturas."
        );
        setFacturas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFacturas();
  }, []);

  // Orden por fecha desc
  const facturasOrdenadas = useMemo(
    () =>
      [...facturas].sort(
        (a, b) =>
          new Date(b.fecha_factura || 0) - new Date(a.fecha_factura || 0)
      ),
    [facturas]
  );

  // Helpers
  const normalizarPV = (pv) => {
    if (!pv) return [];
    if (Array.isArray(pv)) return pv;
    try {
      return JSON.parse(pv);
    } catch {
      return [];
    }
  };

  const contarItems = (pv) =>
    normalizarPV(pv).reduce(
      (s, it) => s + (Number(it.cantidad_vendida) || 0),
      0
    );

  const toggleExpand = (cod) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(cod)) n.delete(cod);
      else n.add(cod);
      return n;
    });
  };

  const copiarJSON = async (obj) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    } catch {
      // noop
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Historial de Ventas</h1>

      <div className="bg-card p-6 rounded-xl">
        <div className="flex items-center mb-6">
          <Calendar size={24} className="mr-2" />
          <h2 className="text-xl">Ventas Recientes</h2>
        </div>

        {err && (
          <div className="mb-4 px-3 py-2 rounded border border-red-500/60 bg-red-500/15 text-red-300 flex items-center gap-2">
            <AlertTriangle size={18} /> <span>{err}</span>
          </div>
        )}
        {loading && (
          <div className="mb-4 text-sm text-muted">Cargando facturas...</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Código Factura</th>
                <th className="px-4 py-2 text-left">Documento Cliente</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Código Transacción</th>
                <th className="px-4 py-2 text-left">Ítems</th>
                <th className="px-4 py-2 text-left">Detalles</th>
              </tr>
            </thead>

            <tbody>
              {!loading && facturasOrdenadas.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-muted" colSpan={7}>
                    No hay facturas registradas.
                  </td>
                </tr>
              )}

              {facturasOrdenadas.map((f) => {
                const isOpen = expanded.has(f.codigo_factura);
                const productos = normalizarPV(f.productos_vendidos);
                return (
                  <Fragment key={f.codigo_factura}>
                    <tr className="hover:bg-gray-600">
                      <td className="px-4 py-2">
                        {f.fecha_factura
                          ? new Date(f.fecha_factura).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2">{f.codigo_factura}</td>
                      <td className="px-4 py-2">{f.documento_cliente}</td>
                      <td className="px-4 py-2">
                        <DollarSign className="inline-block mr-1" />
                        {(Number(f.total_factura) || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">{f.codigo_transaccion}</td>
                      <td className="px-4 py-2">{contarItems(f.productos_vendidos)}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => toggleExpand(f.codigo_factura)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 inline-flex items-center gap-2"
                        >
                          {isOpen ? (
                            <>
                              <EyeOff size={16} /> Ocultar
                            </>
                          ) : (
                            <>
                              <Eye size={16} /> Ver detalles
                            </>
                          )}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="bg-gray-800/60">
                        <td className="px-4 py-4" colSpan={7}>
                          {/* Subtabla de productos_vendidos */}
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">
                              Productos vendidos
                            </h4>
                            {productos.length === 0 ? (
                              <p className="text-sm text-muted">
                                (Sin productos registrados en esta factura)
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-gray-700 text-white">
                                      <th className="px-3 py-2 text-left">
                                        Código producto
                                      </th>
                                      <th className="px-3 py-2 text-left">
                                        Cantidad vendida
                                      </th>
                                      <th className="px-3 py-2 text-left">
                                        Precio venta
                                      </th>
                                      <th className="px-3 py-2 text-left">
                                        Subtotal
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {productos.map((p, idx) => {
                                      const qty = Number(p.cantidad_vendida) || 0;
                                      const prc = Number(p.precio_venta) || 0;
                                      return (
                                        <tr key={idx} className="hover:bg-gray-700/50">
                                          <td className="px-3 py-2">
                                            {p.codigo_producto}
                                          </td>
                                          <td className="px-3 py-2">{qty}</td>
                                          <td className="px-3 py-2">
                                            ${prc.toLocaleString()}
                                          </td>
                                          <td className="px-3 py-2">
                                            ${(qty * prc).toLocaleString()}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          {/* JSON completo tal cual API */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">Detsalles especificos de la venta</h4>
                              <button
                                onClick={() => copiarJSON(f)}
                                className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded inline-flex items-center gap-1"
                                title="Copiar JSON"
                              >
                                <Clipboard size={14} /> Copiar
                              </button>
                            </div>
                            <pre className="bg-black/40 border border-gray-700 rounded p-3 overflow-auto text-xs text-gray-200 max-h-80">
{JSON.stringify(f, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// pequeño helper para permitir <Fragment/> sin import explícito arriba
function Fragment({ children }) {
  return children;
}

export default HistorialVentas;
