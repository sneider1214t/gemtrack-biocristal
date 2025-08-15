// src/components/Recordatorios.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, X, Save, Calendar } from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:3000/api/mantenimiento",
  headers: { "Content-Type": "application/json" },
});

// Helpers
const formatDate = (d) => {
  if (!d) return "";
  try {
    const dd = new Date(d);
    if (Number.isNaN(dd.getTime())) return String(d);
    return dd.toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
};
const isValidDateInput = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v ?? "");
const toISODate = (v) => (isValidDateInput(v) ? v : formatDate(v));

// Estado visual (chip) según “próximo mantenimiento”
function statusFromDate(proximo) {
  if (!proximo) return { label: "Sin fecha", color: "bg-gray-100 text-gray-800" };
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const px = new Date(proximo);
  if (Number.isNaN(px.getTime())) return { label: "Fecha inválida", color: "bg-gray-100 text-gray-800" };

  const diffDays = Math.floor((px.getTime() - base) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" }; // vencido
  if (diffDays <= 7) return { label: "Próximo", color: "bg-amber-100 text-amber-800" };    // dentro de 7 días
  return { label: "Programado", color: "bg-green-100 text-green-800" };
}

export default function Recordatorios() {
  const [mants, setMants] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // Edición en línea por card
  const [editingId, setEditingId] = useState(null); // id_mantenimiento en edición
  const [rowEdit, setRowEdit] = useState({});       // cambios parciales

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mantToDelete, setMantToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form crear
  const [formData, setFormData] = useState({
    id_mantenimiento: "",
    codigo_producto: "",
    fecha_mantenimiento: "",
    proximo_mantenimiento: "",
  });

  // Interceptor token (si usas auth)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const interceptor = api.interceptors.request.use((cfg) => {
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      return cfg;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, []);

  // Cargar mantenimientos
  useEffect(() => {
    fetchMantenimientos();
  }, []);

  const fetchMantenimientos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/");
      setMants(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error al obtener mantenimientos:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error al obtener los mantenimientos"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearMessagesLater = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  /* ============== CREAR ============== */
  const handleInputChangeCreate = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validateCreate = () => {
    if (!String(formData.id_mantenimiento).trim())
      return setError("El ID de mantenimiento es obligatorio"), false;
    if (!String(formData.codigo_producto).trim())
      return setError("El código de producto es obligatorio"), false;

    const f1 = toISODate(formData.fecha_mantenimiento);
    const f2 = toISODate(formData.proximo_mantenimiento);
    if (!isValidDateInput(f1)) return setError("Fecha de mantenimiento inválida (YYYY-MM-DD)"), false;
    if (!isValidDateInput(f2)) return setError("Próximo mantenimiento inválido (YYYY-MM-DD)"), false;

    // Regla opcional: próximo >= fecha actual
    if (new Date(f2).getTime() < new Date(f1).getTime())
      return setError("El próximo mantenimiento no puede ser anterior al último."), false;

    return true;
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateCreate()) return clearMessagesLater();

    const payload = {
      id_mantenimiento: String(formData.id_mantenimiento).trim(),
      fecha_mantenimiento: toISODate(formData.fecha_mantenimiento),
      proximo_mantenimiento: toISODate(formData.proximo_mantenimiento),
      codigo_producto: String(formData.codigo_producto).trim(),
    };

    try {
      setSaving(true);
      await api.post("/", payload);
      setSuccess("Mantenimiento registrado correctamente");
      await fetchMantenimientos();
      setFormData({
        id_mantenimiento: "",
        codigo_producto: "",
        fecha_mantenimiento: "",
        proximo_mantenimiento: "",
      });
      setIsAdding(false);
    } catch (err) {
      console.error("Error al crear mantenimiento:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error al guardar el mantenimiento"
      );
    } finally {
      setSaving(false);
      clearMessagesLater();
    }
  };

  /* ============== EDITAR EN LÍNEA ============== */
  const startEdit = (m) => {
    setIsAdding(false);     // cierra form de creación
    setRowEdit({});
    setEditingId(String(m.id_mantenimiento));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRowEdit({});
  };

  const onRowChange = (field, value) => {
    setRowEdit((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (id) => {
    const idStr = String(id);
    const original = mants.find((x) => String(x.id_mantenimiento) === idStr);
    if (!original) return;

    // Fusionar cambios parciales con el original
    const merged = {
      fecha_mantenimiento:
        rowEdit.fecha_mantenimiento !== undefined
          ? toISODate(rowEdit.fecha_mantenimiento)
          : toISODate(original.fecha_mantenimiento),
      proximo_mantenimiento:
        rowEdit.proximo_mantenimiento !== undefined
          ? toISODate(rowEdit.proximo_mantenimiento)
          : toISODate(original.proximo_mantenimiento),
      codigo_producto:
        rowEdit.codigo_producto !== undefined
          ? String(rowEdit.codigo_producto).trim()
          : String(original.codigo_producto || "").trim(),
    };

    // Validaciones
    if (!isValidDateInput(merged.fecha_mantenimiento))
      return setError("Fecha de mantenimiento inválida (YYYY-MM-DD)"), clearMessagesLater();
    if (!isValidDateInput(merged.proximo_mantenimiento))
      return setError("Próximo mantenimiento inválido (YYYY-MM-DD)"), clearMessagesLater();
    if (!merged.codigo_producto)
      return setError("El código de producto es obligatorio"), clearMessagesLater();
    if (new Date(merged.proximo_mantenimiento).getTime() < new Date(merged.fecha_mantenimiento).getTime())
      return setError("El próximo mantenimiento no puede ser anterior al último."), clearMessagesLater();

    try {
      setSaving(true);
      await api.put(`/${encodeURIComponent(idStr)}`, merged);
      setSuccess("Mantenimiento actualizado correctamente");
      await fetchMantenimientos();
      cancelEdit();
    } catch (err) {
      console.error("Error al actualizar mantenimiento:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error al actualizar el mantenimiento"
      );
      clearMessagesLater();
    } finally {
      setSaving(false);
    }
  };

  /* ============== ELIMINAR ============== */
  const requestDelete = (m) => {
    setMantToDelete(m);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!mantToDelete?.id_mantenimiento) return;
    try {
      setDeleting(true);
      await api.delete(`/${encodeURIComponent(mantToDelete.id_mantenimiento)}`);
      setSuccess("Mantenimiento eliminado correctamente");
      await fetchMantenimientos();
    } catch (err) {
      console.error("Error al eliminar mantenimiento:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error al eliminar el mantenimiento"
      );
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setMantToDelete(null);
      clearMessagesLater();
    }
  };

  /* ============== FILTRO ============== */
  const filtered = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    return mants.filter((m) => {
      const id = String(m.id_mantenimiento || "").toLowerCase();
      const cod = String(m.codigo_producto || "").toLowerCase();
      const f1 = String(formatDate(m.fecha_mantenimiento) || "").toLowerCase();
      const f2 = String(formatDate(m.proximo_mantenimiento) || "").toLowerCase();
      return id.includes(q) || cod.includes(q) || f1.includes(q) || f2.includes(q);
    });
  }, [mants, searchTerm]);

  /* ============== UI ============== */
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-4"></div>
          <p className="text-lg">Cargando mantenimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-accent">Recordatorios</h2>
          <p className="text-muted">
            Mantén al día los <span className="text-accent">mantenimientos</span> de productos:
            programa, edita y revisa próximos vencimientos para evitar sorpresas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setEditingId(null); // por si estabas editando
            setFormData({
              id_mantenimiento: "",
              codigo_producto: "",
              fecha_mantenimiento: "",
              proximo_mantenimiento: "",
            });
          }}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo mantenimiento
        </button>
      </div>

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

      {/* Formulario de creación */}
      {isAdding && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-white">Registrar mantenimiento</h3>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ID Mantenimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="id_mantenimiento"
                  value={formData.id_mantenimiento}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Código de producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="codigo_producto"
                  value={formData.codigo_producto}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fecha de mantenimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_mantenimiento"
                  value={formData.fecha_mantenimiento}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Próximo mantenimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="proximo_mantenimiento"
                  value={formData.proximo_mantenimiento}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setFormData({
                    id_mantenimiento: "",
                    codigo_producto: "",
                    fecha_mantenimiento: "",
                    proximo_mantenimiento: "",
                  });
                  setError("");
                }}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por ID, código de producto o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      {/* Tarjetas (cards largas) */}
      <div className="bg-gray-800 rounded-lg">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filtered.map((m) => {
              const isRowEditing = String(editingId) === String(m.id_mantenimiento);

              const valCodigo =
                isRowEditing && rowEdit.codigo_producto !== undefined
                  ? rowEdit.codigo_producto
                  : m.codigo_producto || "";

              const valFecha =
                isRowEditing && rowEdit.fecha_mantenimiento !== undefined
                  ? rowEdit.fecha_mantenimiento
                  : formatDate(m.fecha_mantenimiento) || "";

              const valProx =
                isRowEditing && rowEdit.proximo_mantenimiento !== undefined
                  ? rowEdit.proximo_mantenimiento
                  : formatDate(m.proximo_mantenimiento) || "";

              const st = statusFromDate(valProx || m.proximo_mantenimiento);

              return (
                <div
                  key={m.id_mantenimiento}
                  className="bg-card border border-gray-700 rounded-xl p-5 shadow-md flex flex-col gap-4"
                >
                  {/* Encabezado */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Mantenimiento #{m.id_mantenimiento}
                      </h3>
                      {!isRowEditing && (
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                          <Calendar size={14} /> Recordatorio de producto
                        </p>
                      )}
                    </div>

                    {/* Chip de estado o, si edita, nada aquí */}
                    {!isRowEditing && (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${st.color}`}>
                        {st.label}
                      </span>
                    )}
                  </div>

                  {/* Contenido (muestra o inputs si está editando) */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Código producto:</span>
                      {!isRowEditing ? (
                        <span className="text-white font-medium">{m.codigo_producto}</span>
                      ) : (
                        <input
                          type="text"
                          value={valCodigo}
                          onChange={(e) => onRowChange("codigo_producto", e.target.value)}
                          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Último mantenimiento:</span>
                      {!isRowEditing ? (
                        <span className="text-white">{formatDate(m.fecha_mantenimiento)}</span>
                      ) : (
                        <input
                          type="date"
                          value={valFecha}
                          onChange={(e) => onRowChange("fecha_mantenimiento", e.target.value)}
                          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Próximo mantenimiento:</span>
                      {!isRowEditing ? (
                        <span className="text-white">{formatDate(m.proximo_mantenimiento)}</span>
                      ) : (
                        <input
                          type="date"
                          value={valProx}
                          onChange={(e) => onRowChange("proximo_mantenimiento", e.target.value)}
                          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-end gap-3 pt-2">
                    {isRowEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(m.id_mantenimiento)}
                          className="text-green-400 hover:text-green-300"
                          title="Guardar"
                          disabled={saving}
                        >
                          <Save size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-gray-400 hover:text-gray-300"
                          title="Cancelar"
                          disabled={saving}
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(m)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(m)}
                          className="text-red-400 hover:text-red-300"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {searchTerm
                ? "No se encontraron mantenimientos que coincidan con la búsqueda."
                : "No hay mantenimientos registrados. Comienza agregando uno nuevo."}
            </p>
            {!searchTerm && !isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="mt-4 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Nuevo mantenimiento
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Eliminar mantenimiento</h4>
              <button
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                className="text-gray-400 hover:text-white"
                disabled={deleting}
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-300 mb-6">
              ¿Seguro que deseas eliminar el mantenimiento{" "}
              <span className="font-semibold text-white">#{mantToDelete?.id_mantenimiento}</span>{" "}
              (Producto: {mantToDelete?.codigo_producto})? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className={`px-4 py-2 rounded-md text-white ${
                  deleting ? "bg-red-700/70" : "bg-red-600 hover:bg-red-700"
                }`}
                disabled={deleting}
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
