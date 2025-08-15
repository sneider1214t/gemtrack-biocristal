import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Database,
  ChevronDown,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Search,
} from "lucide-react";

/* ==============================
   CONFIG LOCAL POR TABLA (sin tablesConfig.js)
   ============================== */

const API_BASE = "http://localhost:3000/api";

// util: crea endpoint absoluto
const ep = (p) => `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`;

// Definición de campos: tipo, label, required, opciones, editableOnUpdate, creatable
// idKey: campo que identifica el registro para PUT/DELETE
// requiresMultipart: para 'Productos' (usa FormData)
const TABLE_DEFS = [
  {
    key: "categorias",
    label: "Categorías",
    endpoint: ep("/categorias"),
    idKey: "id_categoria",
    requiresMultipart: false,
    columns: ["id_categoria", "nombre_categoria"],
    createFields: [
      { name: "id_categoria", label: "ID Categoría", type: "text", required: true },
      { name: "nombre_categoria", label: "Nombre", type: "text", required: true },
    ],
    updateFields: [
      // API solo actualiza nombre
      { name: "nombre_categoria", label: "Nombre", type: "text", required: true },
    ],
  },
  {
    key: "clientes",
    label: "Clientes",
    endpoint: ep("/clientes"),
    idKey: "documento_cliente",
    requiresMultipart: false,
    columns: ["documento_cliente", "nombre_cliente", "email", "telefono"],
    createFields: [
      { name: "documento_cliente", label: "Documento", type: "text", required: true, maxLength: 10 },
      { name: "nombre_cliente", label: "Nombre", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "telefono", label: "Teléfono", type: "text", required: true, maxLength: 10 },
    ],
    updateFields: [
      { name: "nombre_cliente", label: "Nombre", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "telefono", label: "Teléfono", type: "text", required: true, maxLength: 10 },
    ],
  },
  {
    key: "devolucion",
    label: "Devoluciones",
    endpoint: ep("/devolucion"),
    idKey: "codigo_devolucion",
    requiresMultipart: false,
    columns: [
      "codigo_devolucion",
      "fecha_devolucion",
      "motivo_devolucion",
      "codigo_factura",
      "codigo_producto",
    ],
    createFields: [
      { name: "codigo_devolucion", label: "Código Devolución", type: "text", required: true },
      { name: "fecha_devolucion", label: "Fecha", type: "date", required: true },
      { name: "motivo_devolucion", label: "Motivo", type: "text", required: true },
      { name: "codigo_factura", label: "Código Factura", type: "text", required: true },
      { name: "codigo_producto", label: "Código Producto", type: "text", required: true },
    ],
    updateFields: [
      { name: "fecha_devolucion", label: "Fecha", type: "date", required: true },
      { name: "motivo_devolucion", label: "Motivo", type: "text", required: true },
      { name: "codigo_factura", label: "Código Factura", type: "text", required: true },
      { name: "codigo_producto", label: "Código Producto", type: "text", required: true },
    ],
  },
  {
    key: "exportacion",
    label: "Exportaciones",
    endpoint: ep("/exportacion"),
    idKey: "id_exportacion",
    requiresMultipart: false,
    columns: ["id_exportacion", "fecha_exportacion", "sistema_destino", "documento_usuario"],
    createFields: [
      { name: "id_exportacion", label: "ID Exportación", type: "text", required: true },
      { name: "fecha_exportacion", label: "Fecha", type: "date", required: true },
      { name: "sistema_destino", label: "Sistema Destino", type: "text", required: true },
      { name: "documento_usuario", label: "Documento Usuario", type: "text", required: true },
    ],
    updateFields: [
      { name: "fecha_exportacion", label: "Fecha", type: "date", required: true },
      { name: "sistema_destino", label: "Sistema Destino", type: "text", required: true },
      { name: "documento_usuario", label: "Documento Usuario", type: "text", required: true },
    ],
  },
  {
    key: "importacion",
    label: "Importaciones",
    endpoint: ep("/importacion"),
    idKey: "id_importacion",
    requiresMultipart: false,
    columns: ["id_importacion", "fecha_importacion", "sistema_origen", "documento_usuario"],
    createFields: [
      { name: "id_importacion", label: "ID Importación", type: "text", required: true },
      { name: "fecha_importacion", label: "Fecha", type: "date", required: true },
      { name: "sistema_origen", label: "Sistema Origen", type: "text", required: true },
      { name: "documento_usuario", label: "Documento Usuario", type: "text", required: true },
    ],
    updateFields: [
      { name: "fecha_importacion", label: "Fecha", type: "date", required: true },
      { name: "sistema_origen", label: "Sistema Origen", type: "text", required: true },
      { name: "documento_usuario", label: "Documento Usuario", type: "text", required: true },
    ],
  },
  {
    key: "mantenimiento",
    label: "Mantenimientos",
    endpoint: ep("/mantenimiento"),
    idKey: "id_mantenimiento",
    requiresMultipart: false,
    columns: ["id_mantenimiento", "fecha_mantenimiento", "proximo_mantenimiento", "codigo_producto"],
    createFields: [
      { name: "id_mantenimiento", label: "ID Mantenimiento", type: "text", required: true },
      { name: "fecha_mantenimiento", label: "Fecha", type: "date", required: true },
      { name: "proximo_mantenimiento", label: "Próximo", type: "date", required: true },
      { name: "codigo_producto", label: "Código Producto", type: "text", required: true },
    ],
    updateFields: [
      { name: "fecha_mantenimiento", label: "Fecha", type: "date", required: true },
      { name: "proximo_mantenimiento", label: "Próximo", type: "date", required: true },
      { name: "codigo_producto", label: "Código Producto", type: "text", required: true },
    ],
  },
  {
    key: "productos",
    label: "Productos",
    endpoint: ep("/productos"),
    idKey: "codigo_producto",
    requiresMultipart: true, // usa FormData por multer
    columns: [
      "codigo_producto",
      "nombre_producto",
      "unidad_medida",
      "precio_compra",
      "precio_venta",
      "nombre_ubicacion",
      "nit_proveedor",
      "id_categoria",
      "stock",
      "imagen_producto",
    ],
    createFields: [
      { name: "codigo_producto", label: "Código", type: "text", required: true },
      { name: "nombre_producto", label: "Nombre", type: "text", required: true },
      { name: "unidad_medida", label: "Unidad de Medida", type: "text", required: true },
      { name: "precio_compra", label: "Precio Compra", type: "number", required: true },
      { name: "precio_venta", label: "Precio Venta", type: "number", required: true },
      { name: "nombre_ubicacion", label: "Ubicación", type: "text", required: true },
      { name: "nit_proveedor", label: "NIT Proveedor", type: "text", required: true },
      { name: "id_categoria", label: "ID Categoría", type: "text", required: true },
      { name: "stock", label: "Stock", type: "number", required: true },
      { name: "imagen_producto", label: "Imagen (opcional)", type: "file", required: false },
    ],
    updateFields: [
      // En update, puedes cambiar todo; imagen opcional
      { name: "nombre_producto", label: "Nombre", type: "text", required: true },
      { name: "unidad_medida", label: "Unidad de Medida", type: "text", required: true },
      { name: "precio_compra", label: "Precio Compra", type: "number", required: true },
      { name: "precio_venta", label: "Precio Venta", type: "number", required: true },
      { name: "nombre_ubicacion", label: "Ubicación", type: "text", required: true },
      { name: "nit_proveedor", label: "NIT Proveedor", type: "text", required: true },
      { name: "id_categoria", label: "ID Categoría", type: "text", required: true },
      { name: "stock", label: "Stock", type: "number", required: true },
      { name: "imagen_producto", label: "Imagen (opcional)", type: "file", required: false },
    ],
  },
  {
    key: "proveedores",
    label: "Proveedores",
    endpoint: ep("/proveedores"),
    idKey: "nit_proveedor",
    requiresMultipart: false,
    columns: [
      "nit_proveedor",
      "nombre_proveedor",
      "direccion_proveedor",
      "email_proveedor",
    ],
    createFields: [
      { name: "nit_proveedor", label: "NIT", type: "text", required: true },
      { name: "nombre_proveedor", label: "Nombre", type: "text", required: true },
      { name: "direccion_proveedor", label: "Dirección", type: "text", required: true },
      { name: "email_proveedor", label: "Email", type: "email", required: true },
    ],
    updateFields: [
      { name: "nombre_proveedor", label: "Nombre", type: "text", required: true },
      { name: "direccion_proveedor", label: "Dirección", type: "text", required: true },
      { name: "email_proveedor", label: "Email", type: "email", required: true },
    ],
  },
  {
    key: "transaccion",
    label: "Transacciones",
    endpoint: ep("/transaccion"),
    idKey: "codigo_transaccion",
    requiresMultipart: false,
    columns: [
      "codigo_transaccion",
      "fecha_transaccion",
      "tipo_transaccion",
      "ingreso_caja",
      "egreso_caja",
      "documento_usuario",
    ],
    createFields: [
      { name: "codigo_transaccion", label: "Código", type: "text", required: true },
      { name: "fecha_transaccion", label: "Fecha", type: "date", required: true },
      {
        name: "tipo_transaccion",
        label: "Tipo",
        type: "select",
        options: ["Efectivo", "Transferencia"],
        required: true,
      },
      { name: "ingreso_caja", label: "Ingreso", type: "number", required: true },
      { name: "egreso_caja", label: "Egreso", type: "number", required: true },
      { name: "documento_usuario", label: "Documento Usuario", type: "text", required: true },
    ],
    updateFields: [
      { name: "fecha_transaccion", label: "Fecha", type: "date", required: true },
      {
        name: "tipo_transaccion",
        label: "Tipo",
        type: "select",
        options: ["Efectivo", "Transferencia"],
        required: true,
      },
      { name: "ingreso_caja", label: "Ingreso", type: "number", required: true },
      { name: "egreso_caja", label: "Egreso", type: "number", required: true },
      { name: "documento_usuario", label: "Documento Usuario", type: "text", required: true },
    ],
  },
  {
    key: "ubicacion",
    label: "Ubicaciones",
    endpoint: ep("/ubicacion"),
    idKey: "nombre_ubicacion",
    requiresMultipart: false,
    columns: ["nombre_ubicacion", "estado_ubicacion"],
    createFields: [
      { name: "nombre_ubicacion", label: "Nombre", type: "text", required: true },
      {
        name: "estado_ubicacion",
        label: "Estado",
        type: "select",
        options: ["Ocupada", "Con espacio"],
        required: true,
      },
    ],
    updateFields: [
      // API solo permite actualizar estado por nombre
      {
        name: "estado_ubicacion",
        label: "Estado",
        type: "select",
        options: ["Ocupada", "Con espacio"],
        required: true,
      },
    ],
  },
  {
    key: "usuarios",
    label: "Usuarios",
    endpoint: ep("/usuarios"),
    idKey: "documento_usuario",
    requiresMultipart: false,
    columns: [
      "documento_usuario",
      "nombre_usuario",
      "email_usuario",
      "rol_usuario",
      // no mostramos contraseña
    ],
    createFields: [
      { name: "documento_usuario", label: "Documento", type: "text", required: true },
      { name: "nombre_usuario", label: "Nombre", type: "text", required: true },
      { name: "email_usuario", label: "Email", type: "email", required: true },
      {
        name: "rol_usuario",
        label: "Rol",
        type: "select",
        options: ["Administrador", "Empleado"],
        required: true,
      },
      { name: "contraseña_usuario", label: "Contraseña", type: "password", required: true },
    ],
    updateFields: [
      { name: "nombre_usuario", label: "Nombre", type: "text", required: true },
      { name: "email_usuario", label: "Email", type: "email", required: true },
      {
        name: "rol_usuario",
        label: "Rol",
        type: "select",
        options: ["Administrador", "Empleado"],
        required: true,
      },
      // contraseña opcional
      { name: "contraseña_usuario", label: "Contraseña (opcional)", type: "password", required: false },
    ],
  },
];

/* ==============================
   AXIOS con token (si existe)
   ============================== */
const api = axios.create({
  headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ==============================
   UI Helpers
   ============================== */

const Input = ({ field, value, onChange }) => {
  const base =
    "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white";
  if (field.type === "select") {
    return (
      <select
        className={base}
        value={value ?? ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        required={field.required}
      >
        <option value="" disabled>
          {field.label}
        </option>
        {(field.options || []).map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "file") {
    return (
      <input
        type="file"
        accept="image/*"
        className={base}
        onChange={(e) => onChange(field.name, e.target.files?.[0] || null)}
      />
    );
  }
  return (
    <input
      type={field.type || "text"}
      className={base}
      value={value ?? ""}
      onChange={(e) => onChange(field.name, e.target.value)}
      required={field.required}
      maxLength={field.maxLength}
    />
  );
};

const pretty = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

/* ==============================
   COMPONENTE PRINCIPAL
   ============================== */

export default function RegistroTablas() {
  const [selectedKey, setSelectedKey] = useState("");
  const selectedDef = useMemo(
    () => TABLE_DEFS.find((t) => t.key === selectedKey) || null,
    [selectedKey]
  );

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [rowEdit, setRowEdit] = useState({});

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({});

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // cargar datos al elegir tabla
  useEffect(() => {
    if (!selectedDef) {
      setRows([]);
      setEditingId(null);
      setIsAdding(false);
      return;
    }
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const showMsgThenClear = (type, msg) => {
    (type === "e" ? setError : setSuccess)(msg);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  const fetchRows = async () => {
    if (!selectedDef) return;
    try {
      setLoading(true);
      const { data } = await api.get(selectedDef.endpoint);
      setRows(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err) {
      console.error(err);
      showMsgThenClear(
        "e",
        err.response?.data?.message || err.response?.data?.error || "Error al obtener datos"
      );
    } finally {
      setLoading(false);
    }
  };

  // helpers
  const getId = (row) => String(row?.[selectedDef?.idKey || ""] ?? "");
  const buildUrlForId = (id) =>
    `${selectedDef.endpoint}/${encodeURIComponent(String(id))}`;

  const startEdit = (row) => {
    setIsAdding(false);
    setEditingId(getId(row));
    setRowEdit({});
  };
  const cancelEdit = () => {
    setEditingId(null);
    setRowEdit({});
  };
  const onRowChange = (name, value) => {
    setRowEdit((p) => ({ ...p, [name]: value }));
  };

  const onCreateChange = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validateRequired = (fields, dataObj) => {
    for (const f of fields) {
      if (f.required && (dataObj[f.name] === undefined || dataObj[f.name] === "" || dataObj[f.name] === null)) {
        return `El campo "${f.label}" es obligatorio`;
      }
    }
    return "";
  };

  /* ===================== CREAR ===================== */
  const submitCreate = async (e) => {
    e?.preventDefault?.();
    if (!selectedDef) return;
    const fields = selectedDef.createFields || [];
    const msg = validateRequired(fields, formData);
    if (msg) return showMsgThenClear("e", msg);

    try {
      setSaving(true);

      if (selectedDef.requiresMultipart) {
        const fd = new FormData();
        for (const f of fields) {
          const v = formData[f.name];
          // archivo (opcional)
          if (f.type === "file") {
            if (v) fd.append(f.name, v);
          } else {
            fd.append(f.name, v ?? "");
          }
        }
        await api.post(selectedDef.endpoint, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(selectedDef.endpoint, formData);
      }

      showMsgThenClear("s", "Creado correctamente");
      setFormData({});
      setIsAdding(false);
      await fetchRows();
    } catch (err) {
      console.error(err);
      showMsgThenClear(
        "e",
        err.response?.data?.message || err.response?.data?.error || "Error al crear registro"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ===================== EDITAR ===================== */
  const submitEdit = async (row) => {
    if (!selectedDef) return;
    const id = getId(row);
    const fields = selectedDef.updateFields || [];

    // fusionar original + cambios parciales solo para campos del update
    const merged = {};
    for (const f of fields) {
      merged[f.name] =
        rowEdit[f.name] !== undefined ? rowEdit[f.name] : row[f.name];
    }

    const msg = validateRequired(fields, merged);
    if (msg) return showMsgThenClear("e", msg);

    try {
      setSaving(true);

      if (selectedDef.requiresMultipart) {
        const fd = new FormData();
        for (const f of fields) {
          const v = merged[f.name];
          if (f.type === "file") {
            // si no seleccionó nueva imagen, omitimos (API mantiene la anterior)
            if (v instanceof File) fd.append(f.name, v);
          } else {
            fd.append(f.name, v ?? "");
          }
        }
        await api.put(buildUrlForId(id), fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.put(buildUrlForId(id), merged);
      }

      showMsgThenClear("s", "Actualizado correctamente");
      setEditingId(null);
      setRowEdit({});
      await fetchRows();
    } catch (err) {
      console.error(err);
      showMsgThenClear(
        "e",
        err.response?.data?.message || err.response?.data?.error || "Error al actualizar"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ===================== ELIMINAR ===================== */
  const requestDelete = async (row) => {
    if (!selectedDef) return;
    const id = getId(row);
    if (!id) return;
    if (!confirm(`¿Eliminar registro ${id}? Esta acción no se puede deshacer.`)) return;

    try {
      setDeleting(true);
      await api.delete(buildUrlForId(id));
      showMsgThenClear("s", "Eliminado correctamente");
      await fetchRows();
    } catch (err) {
      console.error(err);
      showMsgThenClear(
        "e",
        err.response?.data?.message || err.response?.data?.error || "Error al eliminar"
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ===================== FILTRO ===================== */
  const filteredRows = useMemo(() => {
    if (!selectedDef) return [];
    const cols = selectedDef.columns || [];
    const q = (searchTerm || "").toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      cols.some((c) => String(r[c] ?? "").toLowerCase().includes(q))
    );
  }, [rows, searchTerm, selectedDef]);

  /* ===================== UI ===================== */

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Database size={28} className="text-blue-400" />
          <h1 className="text-3xl font-bold">📊 Registro de Tablas</h1>
        </div>

        {/* Selector de tabla */}
        <div className="relative w-72">
          <button
            onClick={() => setIsDropdownOpen((s) => !s)}
            className="w-full flex justify-between items-center bg-card border border-gray-600 rounded-lg px-4 py-2.5 text-left"
          >
            <span>
              {selectedDef ? selectedDef.label : "Seleccione una tabla"}
            </span>
            <ChevronDown
              className={`transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-card border border-gray-600 rounded-lg shadow-lg max-h-80 overflow-auto">
              {TABLE_DEFS.map((t) => (
                <div
                  key={t.key}
                  onClick={() => {
                    setSelectedKey(t.key);
                    setIsDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                >
                  {t.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
          {success}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-4"></div>
          <p className="text-lg">Cargando datos...</p>
        </div>
      )}

      {/* Contenido principal */}
      {selectedDef && !loading && (
        <>
          {/* Búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-card rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    {selectedDef.columns.map((col) => (
                      <th
                        key={col}
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredRows.length > 0 ? (
                    filteredRows.map((r) => {
                      const isEditing = editingId === getId(r);
                      return (
                        <tr key={getId(r)} className="hover:bg-gray-800">
                          {selectedDef.columns.map((col) => {
                            // ¿es editable este campo en UPDATE?
                            const fDef = (selectedDef.updateFields || []).find(
                              (f) => f.name === col
                            );
                            const isEditable = !!fDef && isEditing;

                            // Si el idKey aparece como columna, no permitir editarlo
                            const isIdCol = col === selectedDef.idKey;

                            if (isEditable && !isIdCol) {
                              const currVal =
                                rowEdit[col] !== undefined ? rowEdit[col] : r[col];
                              return (
                                <td key={col} className="px-6 py-4">
                                  <Input
                                    field={fDef}
                                    value={currVal}
                                    onChange={onRowChange}
                                  />
                                </td>
                              );
                            }
                            // Render texto (o imagen si es imagen_producto)
                            if (col === "imagen_producto" && r[col]) {
                              // Mostrar nombre de archivo (o miniatura si sirves /api/productos/images)
                              return (
                                <td key={col} className="px-6 py-4">
                                  <span className="text-gray-300">
                                    {pretty(r[col])}
                                  </span>
                                </td>
                              );
                            }
                            return (
                              <td key={col} className="px-6 py-4">
                                <span className="text-gray-300">
                                  {pretty(r[col])}
                                </span>
                              </td>
                            );
                          })}

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {isEditing ? (
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => submitEdit(r)}
                                  className="text-green-400 hover:text-green-300"
                                  title="Guardar"
                                  disabled={saving}
                                >
                                  <Save size={18} />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="text-gray-400 hover:text-gray-300"
                                  title="Cancelar"
                                  disabled={saving}
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => startEdit(r)}
                                  className="text-blue-400 hover:text-blue-300"
                                  title="Editar"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => requestDelete(r)}
                                  className="text-red-400 hover:text-red-300"
                                  title="Eliminar"
                                  disabled={deleting}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        className="px-6 py-6 text-center text-gray-400"
                        colSpan={selectedDef.columns.length + 1}
                      >
                        No hay datos para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Crear nuevo */}
          <div className="mt-4 flex justify-end">
            {!isAdding ? (
              <button
                onClick={() => {
                  setIsAdding(true);
                  setEditingId(null);
                  setRowEdit({});
                  setFormData({});
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Agregar Registro
              </button>
            ) : (
              <div className="w-full bg-card p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold mb-3">
                  Nuevo registro en {selectedDef.label}
                </h3>
                <form onSubmit={submitCreate} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedDef.createFields || []).map((f) => (
                      <div key={f.name}>
                        <label className="block text-sm font-medium mb-1">
                          {f.label} {f.required && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                          field={f}
                          value={formData[f.name] ?? (f.type === "select" ? "" : "")}
                          onChange={onCreateChange}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setFormData({});
                      }}
                      className="px-4 py-2 text-gray-300 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedDef && !loading && (
        <div className="text-gray-400 mt-10">
          Selecciona una tabla para comenzar.
        </div>
      )}
    </div>
  );
}
