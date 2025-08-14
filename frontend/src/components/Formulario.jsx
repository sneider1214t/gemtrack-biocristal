// src/components/FormularioProducto.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Formulario({ onClose, onAgregarProducto }) {
  // --- APIs
  const productosApi = axios.create({
    baseURL: "http://localhost:3000/api/productos",
  });
  const ubicacionApi = axios.create({
    baseURL: "http://localhost:3000/api/ubicacion",
  });
  const proveedoresApi = axios.create({
    baseURL: "http://localhost:3000/api/proveedores",
  });
  const categoriasApi = axios.create({
    baseURL: "http://localhost:3000/api/categorias",
  });

  // Inyectar token si existe
  useEffect(() => {
    const token = localStorage.getItem("token");
    const addAuth = (instance) =>
      instance.interceptors.request.use((config) => {
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      });
    const i1 = addAuth(productosApi);
    const i2 = addAuth(ubicacionApi);
    const i3 = addAuth(proveedoresApi);
    const i4 = addAuth(categoriasApi);
    return () => {
      productosApi.interceptors.request.eject(i1);
      ubicacionApi.interceptors.request.eject(i2);
      proveedoresApi.interceptors.request.eject(i3);
      categoriasApi.interceptors.request.eject(i4);
    };
  }, []);

  // --- Opciones de selects
  const [ubicaciones, setUbicaciones] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loadingOpts, setLoadingOpts] = useState(true);
  const [optsError, setOptsError] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOpts(true);
        const [u, p, c] = await Promise.all([
          ubicacionApi.get("/"),
          proveedoresApi.get("/"),
          categoriasApi.get("/"),
        ]);
        setUbicaciones(Array.isArray(u.data) ? u.data : []);
        setProveedores(Array.isArray(p.data) ? p.data : []);
        setCategorias(Array.isArray(c.data) ? c.data : []);
        setOptsError("");
      } catch (err) {
        console.error("Error cargando opciones:", err);
        setOptsError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Error al cargar opciones (ubicación/proveedores/categorías)."
        );
      } finally {
        setLoadingOpts(false);
      }
    };
    fetchOptions();
  }, []);

  // --- Estado del form (coincide con la API de productos)
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // ✅ mensaje de éxito
  const [formValues, setFormValues] = useState({
    codigo_producto: "",
    nombre_producto: "",
    unidad_medida: "",
    precio_compra: "",
    precio_venta: "",
    stock: "",
    nombre_ubicacion: "",
    nit_proveedor: "",
    id_categoria: "",
    imagen_producto: null,
  });

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen_producto") {
      setFormValues((p) => ({ ...p, imagen_producto: files?.[0] || null }));
    } else {
      setFormValues((p) => ({ ...p, [name]: value }));
    }
  };

  const validate = () => {
    const {
      codigo_producto,
      nombre_producto,
      unidad_medida,
      precio_compra,
      precio_venta,
      stock,
      nombre_ubicacion,
      nit_proveedor,
      id_categoria,
    } = formValues;

    if (
      !codigo_producto ||
      !nombre_producto ||
      !unidad_medida ||
      !precio_compra ||
      !precio_venta ||
      nombre_ubicacion === "" ||
      nit_proveedor === "" ||
      id_categoria === "" ||
      stock === ""
    ) {
      setError("Todos los campos son requeridos (la imagen es opcional).");
      return false;
    }
    const pc = Number(precio_compra);
    const pv = Number(precio_venta);
    const st = Number(stock);
    if (Number.isNaN(pc) || pc < 0) {
      setError("Precio de compra debe ser un número ≥ 0.");
      return false;
    }
    if (Number.isNaN(pv) || pv < 0) {
      setError("Precio de venta debe ser un número ≥ 0.");
      return false;
    }
    if (!Number.isInteger(st) || st < 0) {
      setError("Stock debe ser un entero ≥ 0.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validate()) {
      // limpiar error después de 3s
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setSaving(true);

      // Construir FormData para multer
      const fd = new FormData();
      fd.append("codigo_producto", formValues.codigo_producto.trim());
      fd.append("nombre_producto", formValues.nombre_producto.trim());
      fd.append("unidad_medida", formValues.unidad_medida.trim());
      fd.append("precio_compra", String(formValues.precio_compra));
      fd.append("precio_venta", String(formValues.precio_venta));
      fd.append("stock", String(formValues.stock));
      fd.append("nombre_ubicacion", formValues.nombre_ubicacion);
      fd.append("nit_proveedor", formValues.nit_proveedor);
      fd.append("id_categoria", formValues.id_categoria);
      if (formValues.imagen_producto) {
        fd.append("imagen_producto", formValues.imagen_producto);
      }

      const { data } = await productosApi.post("/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("✅ Producto creado correctamente."); // ✅ éxito
      // auto-cerrar el modal para que se vea el mensaje y luego cerrar
      setTimeout(() => {
        if (typeof onAgregarProducto === "function") onAgregarProducto(data);
        if (typeof onClose === "function") onClose();
        setSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Error al crear producto:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error al crear el producto."
      );
      // auto-ocultar error
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-[#1e3a8a] p-8 rounded-xl shadow-2xl w-full max-w-md relative text-white">
        <h2 className="text-2xl font-bold text-center mb-6">Agregar producto</h2>

        {/* Alert de ÉXITO */}
        {success && (
          <div className="mb-4 flex items-start gap-2 bg-green-500/20 border border-green-400 text-white px-3 py-2 rounded">
            <CheckCircle className="mt-0.5 h-5 w-5" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Errores de carga de opciones */}
        {optsError && (
          <div className="mb-4 flex items-start gap-2 bg-red-500/20 border border-red-400 text-white px-3 py-2 rounded">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <span className="text-sm">{optsError}</span>
          </div>
        )}

        {/* Error de guardado/validación */}
        {error && (
          <div className="mb-4 flex items-start gap-2 bg-red-500/20 border border-red-400 text-white px-3 py-2 rounded">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Código */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Código</label>
            <input
              type="text"
              name="codigo_producto"
              value={formValues.codigo_producto}
              onChange={onChange}
              className="w-full p-3 rounded-md bg-[#f0f8ff] text-black"
              placeholder="Ej: PRO-001"
              required
            />
          </div>

          {/* Nombre */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Nombre</label>
            <input
              type="text"
              name="nombre_producto"
              value={formValues.nombre_producto}
              onChange={onChange}
              className="w-full p-3 rounded-md bg-[#f0f8ff] text-black"
              required
            />
          </div>

          {/* Unidad de medida */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Unidad de medida</label>
            <input
              type="text"
              name="unidad_medida"
              value={formValues.unidad_medida}
              onChange={onChange}
              className="w-full p-3 rounded-md bg-[#f0f8ff] text-black"
              placeholder="Ej: unidad, caja, kg, g..."
              required
            />
          </div>

          {/* Precios y Stock */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 font-semibold">Precio compra</label>
              <input
                type="number"
                name="precio_compra"
                value={formValues.precio_compra}
                onChange={onChange}
                step="0.01"
                min="0"
                className="w-full p-3 rounded-md bg-[#f0f8ff] text-black"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Precio venta</label>
              <input
                type="number"
                name="precio_venta"
                value={formValues.precio_venta}
                onChange={onChange}
                step="0.01"
                min="0"
                className="w-full p-3 rounded-md bg-[#f0f8ff] text-black"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Stock</label>
              <input
                type="number"
                name="stock"
                value={formValues.stock}
                onChange={onChange}
                min="0"
                className="w-full p-3 rounded-md bg-[#f0f8ff] text-black"
                required
              />
            </div>
          </div>

          {/* Claves foráneas: SELECTS */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Ubicación</label>
            <select
              name="nombre_ubicacion"
              value={formValues.nombre_ubicacion}
              onChange={onChange}
              className="w-full p-3 rounded-md bg-[#f0f8ff] text-black"
              disabled={loadingOpts}
              required
            >
              <option value="" disabled>
                {loadingOpts ? "Cargando ubicaciones..." : "Seleccione ubicación"}
              </option>
              {ubicaciones.map((u) => (
                <option key={u.nombre_ubicacion} value={u.nombre_ubicacion}>
                  {u.nombre_ubicacion}{" "}
                  {u.estado_ubicacion ? `- ${u.estado_ubicacion}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Proveedor (NIT)</label>
            <select
              name="nit_proveedor"
              value={formValues.nit_proveedor}
              onChange={onChange}
              className="w-full p-3 rounded-md bg-[#f0f8ff] text-black"
              disabled={loadingOpts}
              required
            >
              <option value="" disabled>
                {loadingOpts ? "Cargando proveedores..." : "Seleccione proveedor"}
              </option>
              {proveedores.map((p) => (
                <option key={p.nit_proveedor} value={p.nit_proveedor}>
                  {p.nit_proveedor} — {p.nombre_proveedor}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Categoría (ID)</label>
            <select
              name="id_categoria"
              value={formValues.id_categoria}
              onChange={onChange}
              className="w-full p-3 rounded-md bg-[#f0f8ff] text-black"
              disabled={loadingOpts}
              required
            >
              <option value="" disabled>
                {loadingOpts ? "Cargando categorías..." : "Seleccione categoría"}
              </option>
              {categorias.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.id_categoria} — {c.nombre_categoria}
                </option>
              ))}
            </select>
          </div>

          {/* Imagen */}
          <div className="mb-6">
            <label className="block mb-1 font-semibold">Imagen</label>
            <input
              type="file"
              name="imagen_producto"
              accept="image/*"
              onChange={onChange}
              className="w-full p-1 rounded-md bg-white text-black"
            />
            {formValues.imagen_producto && (
              <p className="mt-2 text-xs text-gray-200">
                Seleccionado: {formValues.imagen_producto.name}
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
              disabled={saving || loadingOpts}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
