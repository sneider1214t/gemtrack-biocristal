// src/components/CheckoutForm.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import emailjs from "emailjs-com";
import { useCart } from "../context/CartContext";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

const FACTURAS_URL = "http://localhost:3000/api/factura";
const TRANSACCION_URL = "http://localhost:3000/api/transaccion";
const CLIENTES_URL = "http://localhost:3000/api/clientes";

// (Opcional) EmailJS
const EMAILJS_SERVICE_ID = "";
const EMAILJS_TEMPLATE_ID = "";
const EMAILJS_USER_ID = "";

/* ===== Alert bonito reutilizable ===== */
function InlineAlert({ kind = "success", message, onClose }) {
  const styles =
    kind === "success"
      ? "bg-green-500/15 border-green-500 text-green-300"
      : "bg-red-500/15 border-red-500 text-red-300";
  const Icon = kind === "success" ? CheckCircle2 : AlertTriangle;

  return (
    <div className={`flex items-start gap-3 border rounded-xl p-3 ${styles}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1 text-sm">{message}</div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 text-xs opacity-70 hover:opacity-100"
        title="Cerrar"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function CheckoutForm({ onClose, onSuccess }) {
  const { cart, clearCart } = useCart();

  const facturasApi = axios.create({ baseURL: FACTURAS_URL });
  const transApi = axios.create({ baseURL: TRANSACCION_URL });
  const clientesApi = axios.create({ baseURL: CLIENTES_URL });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const addAuth = (instance) =>
      instance.interceptors.request.use((config) => {
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      });
    const i1 = addAuth(facturasApi);
    const i2 = addAuth(transApi);
    const i3 = addAuth(clientesApi);
    return () => {
      facturasApi.interceptors.request.eject(i1);
      transApi.interceptors.request.eject(i2);
      clientesApi.interceptors.request.eject(i3);
    };
  }, []);

  // Clientes para seleccionar documento_cliente
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoadingClientes(true);
        const { data } = await clientesApi.get("/");
        setClientes(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error cargando clientes:", e);
      } finally {
        setLoadingClientes(false);
      }
    })();
  }, []);

  // Documento del usuario en sesión
  const documentoUsuario = useMemo(() => {
    const direct = localStorage.getItem("documento_usuario");
    if (direct) return direct;
    try {
      const user =
        JSON.parse(localStorage.getItem("user") || "{}") ||
        JSON.parse(localStorage.getItem("auth") || "{}");
      return user?.documento_usuario || user?.documento || user?.id || "";
    } catch {
      return "";
    }
  }, []);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (Number(item.precio) || 0) * (Number(item.grams) || 1),
        0
      ),
    [cart]
  );

  // Agrupar productos del carrito -> productos_vendidos
  const productosVendidos = useMemo(() => {
    const map = new Map();
    for (const it of cart) {
      const codigo = it.productId || it.codigo_producto;
      if (!codigo) continue;
      const qty = Number(it.grams ?? 1) || 1;
      const price = Number(it.precio ?? 0) || 0;
      if (!map.has(codigo)) {
        map.set(codigo, {
          codigo_producto: codigo,
          cantidad_vendida: 0,
          precio_venta: price,
        });
      }
      const obj = map.get(codigo);
      obj.cantidad_vendida += qty;
      obj.precio_venta = price;
    }
    return Array.from(map.values());
  }, [cart]);

  // FACTURA
  const [codigoFactura, setCodigoFactura] = useState(() => `F-${Date.now()}`);
  const [fechaFactura, setFechaFactura] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [documentoCliente, setDocumentoCliente] = useState("");

  // TRANSACCIÓN
  const [codigoTransaccion, setCodigoTransaccion] = useState(
    () => `T-${Date.now()}`
  );
  const [fechaTransaccion, setFechaTransaccion] = useState(
    () => new Date().toISOString().slice(0, 16)
  );
  const [tipoTransaccion, setTipoTransaccion] = useState("Efectivo");
  const ingresoCaja = total;
  const egresoCaja = 0;

  // Datos para email (opcional)
  const [datosEnvio, setDatosEnvio] = useState({
    nombre: "",
    direccion: "",
    correo: "",
    celular: "",
  });
  const onEnvioChange = (e) =>
    setDatosEnvio((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Alerts
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const resetAlertsLater = () =>
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 4000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!cart.length) {
      setErrorMsg("El carrito está vacío.");
      return resetAlertsLater();
    }
    if (!documentoCliente) {
      setErrorMsg("Selecciona un cliente para la factura.");
      return resetAlertsLater();
    }
    if (!documentoUsuario) {
      setErrorMsg("No se encontró el documento del usuario en sesión.");
      return resetAlertsLater();
    }

    try {
      setSaving(true);

      // 1) Transacción
      await transApi.post("/", {
        codigo_transaccion: codigoTransaccion,
        fecha_transaccion: new Date(fechaTransaccion).toISOString(),
        tipo_transaccion: tipoTransaccion,
        ingreso_caja: ingresoCaja,
        egreso_caja: egresoCaja,
        documento_usuario: documentoUsuario,
      });

      // 2) Factura
      await facturasApi.post("/", {
        codigo_factura: codigoFactura,
        fecha_factura: fechaFactura,
        total_factura: total,
        codigo_transaccion: codigoTransaccion,
        documento_cliente: documentoCliente,
        productos_vendidos: productosVendidos,
      });

      // 3) EmailJS (opcional)
      if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_USER_ID) {
        const msg = cart
          .map(
            (i) =>
              `${i.name} - ${i.grams} x $${i.precio} = $${
                (i.grams || 1) * (i.precio || 0)
              }`
          )
          .join("\n");
        const templateParams = { ...datosEnvio, mensaje: msg, total };
        try {
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            EMAILJS_USER_ID
          );
        } catch (err) {
          console.warn("EmailJS no enviado (IDs no configurados).", err);
        }
      }

      setSuccessMsg("✅ ¡Venta registrada correctamente!");
      clearCart();
      if (typeof onSuccess === "function") onSuccess();


      // Reset
      setCodigoFactura(`F-${Date.now()}`);
      setCodigoTransaccion(`T-${Date.now()}`);
      setFechaTransaccion(new Date().toISOString().slice(0, 16));
      setDocumentoCliente("");
      if (onClose) onClose();
    } catch (err) {
      console.error("Error al registrar la venta:", err);
      setErrorMsg(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Ocurrió un error al registrar la venta."
      );
    } finally {
      setSaving(false);
      resetAlertsLater();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      {/* Alerts bonitos */}
      {successMsg && (
        <InlineAlert
          kind="success"
          message={successMsg}
          onClose={() => setSuccessMsg("")}
        />
      )}
      {errorMsg && (
        <InlineAlert
          kind="error"
          message={errorMsg}
          onClose={() => setErrorMsg("")}
        />
      )}

      {/* FACTURA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-muted mb-1">Código factura</label>
          <input
            type="text"
            value={codigoFactura}
            onChange={(e) => setCodigoFactura(e.target.value)}
            className="w-full p-2 rounded bg-background border border-muted text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Fecha factura</label>
        <input
            type="date"
            value={fechaFactura}
            onChange={(e) => setFechaFactura(e.target.value)}
            className="w-full p-2 rounded bg-background border border-muted text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Total</label>
          <input
            type="text"
            value={total.toLocaleString()}
            readOnly
            className="w-full p-2 rounded bg-background border border-muted text-white opacity-80"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Cliente (documento)</label>
        <select
          value={documentoCliente}
          onChange={(e) => setDocumentoCliente(e.target.value)}
          className="w-full p-2 rounded bg-background border border-muted text-white"
          disabled={loadingClientes}
          required
        >
          <option value="">
            {loadingClientes ? "Cargando clientes..." : "Seleccione un cliente"}
          </option>
          {clientes.map((c) => (
            <option key={c.documento_cliente} value={c.documento_cliente}>
              {c.documento_cliente} — {c.nombre_cliente}
            </option>
          ))}
        </select>
      </div>

      {/* TRANSACCIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-muted mb-1">Código transacción</label>
          <input
            type="text"
            value={codigoTransaccion}
            onChange={(e) => setCodigoTransaccion(e.target.value)}
            className="w-full p-2 rounded bg-background border border-muted text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Fecha transacción</label>
          <input
            type="datetime-local"
            value={fechaTransaccion}
            onChange={(e) => setFechaTransaccion(e.target.value)}
            className="w-full p-2 rounded bg-background border border-muted text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Tipo de transacción</label>
          <select
            value={tipoTransaccion}
            onChange={(e) => setTipoTransaccion(e.target.value)}
            className="w-full p-2 rounded bg-background border border-muted text-white"
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-muted mb-1">Ingreso caja</label>
          <input
            type="text"
            value={ingresoCaja.toLocaleString()}
            readOnly
            className="w-full p-2 rounded bg-background border border-muted text-white opacity-80"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Egreso caja</label>
          <input
            type="text"
            value={egresoCaja}
            readOnly
            className="w-full p-2 rounded bg-background border border-muted text-white opacity-80"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Documento usuario (sesión)</label>
          <input
            type="text"
            value={documentoUsuario || ""}
            readOnly
            className="w-full p-2 rounded bg-background border border-muted text-white opacity-80"
          />
        </div>
      </div>

      

      <button
        type="submit"
        disabled={saving || !cart.length}
        className={`w-full bg-accent text-white font-bold py-2 rounded hover:bg-opacity-90 ${
          saving ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {saving ? "Procesando..." : "Realizar compra"}
      </button>
    </form>
  );
}
