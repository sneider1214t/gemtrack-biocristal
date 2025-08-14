import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, X, Save } from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:3000/api/ubicacion",
  headers: { "Content-Type": "application/json" },
});

// Estados válidos que acepta tu API
const ESTADOS = ["Ocupada", "Con espacio"];

function UbicacionesAlmacenes() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // edición en línea
  const [editingNombre, setEditingNombre] = useState(null); // nombre_ubicacion en edición
  const [rowEdit, setRowEdit] = useState({}); // { estado_ubicacion?: string }

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ubicacionToDelete, setUbicacionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form de creación
  const [formData, setFormData] = useState({
    nombre_ubicacion: "",
    estado_ubicacion: "Con espacio",
  });

  // Interceptor de token (si usas auth)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const interceptor = api.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, []);

  // Cargar ubicaciones
  useEffect(() => {
    fetchUbicaciones();
  }, []);

  const fetchUbicaciones = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/");
      setUbicaciones(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error al obtener ubicaciones:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al obtener las ubicaciones"
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

  /* ===================== CREAR ===================== */
  const handleInputChangeCreate = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validateCreate = () => {
    if (!formData.nombre_ubicacion.trim())
      return setError("El nombre de la ubicación es obligatorio"), false;
    if (!ESTADOS.includes(formData.estado_ubicacion))
      return setError("Estado inválido"), false;
    return true;
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateCreate()) return clearMessagesLater();

    const payload = {
      nombre_ubicacion: formData.nombre_ubicacion.trim(),
      estado_ubicacion: formData.estado_ubicacion,
    };

    try {
      setSaving(true);
      await api.post("/", payload);
      setSuccess("Ubicación creada correctamente");
      await fetchUbicaciones();
      setFormData({ nombre_ubicacion: "", estado_ubicacion: "Con espacio" });
      setIsAdding(false);
    } catch (err) {
      console.error("Error al crear ubicación:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al guardar la ubicación"
      );
    } finally {
      setSaving(false);
      clearMessagesLater();
    }
  };

  /* ===================== EDITAR EN LÍNEA ===================== */
  const startEdit = (u) => {
    // cerrar el form de creación para evitar submits accidentales
    setIsAdding(false);
    // limpiar cambios parciales e indicar fila en edición
    setRowEdit({});
    setEditingNombre(String(u.nombre_ubicacion));
  };

  const cancelEdit = () => {
    setEditingNombre(null);
    setRowEdit({});
  };

  const onRowChange = (field, value) => {
    setRowEdit((prev) => ({ ...prev, [field]: value }));
  };

  // Guardar: API solo permite actualizar 'estado_ubicacion'
  const saveEdit = async (nombre) => {
    const nameStr = String(nombre);
    const original = ubicaciones.find(
      (x) => String(x.nombre_ubicacion) === nameStr
    );
    if (!original) return;

    const mergedEstado =
      rowEdit.estado_ubicacion !== undefined
        ? rowEdit.estado_ubicacion
        : original.estado_ubicacion;

    if (!ESTADOS.includes(mergedEstado))
      return setError("Estado inválido"), clearMessagesLater();

    try {
      setSaving(true);
      await api.put(`/${encodeURIComponent(nameStr)}`, {
        estado_ubicacion: mergedEstado,
      });
      setSuccess("Ubicación actualizada correctamente");
      await fetchUbicaciones();
      cancelEdit();
    } catch (err) {
      console.error("Error al actualizar ubicación:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al actualizar la ubicación"
      );
      clearMessagesLater();
    } finally {
      setSaving(false);
    }
  };

  /* ===================== ELIMINAR ===================== */
  const requestDelete = (u) => {
    setUbicacionToDelete(u);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!ubicacionToDelete?.nombre_ubicacion) return;
    try {
      setDeleting(true);
      await api.delete(`/${encodeURIComponent(ubicacionToDelete.nombre_ubicacion)}`);
      setSuccess("Ubicación eliminada correctamente");
      await fetchUbicaciones();
    } catch (err) {
      console.error("Error al eliminar ubicación:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al eliminar la ubicación"
      );
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setUbicacionToDelete(null);
      clearMessagesLater();
    }
  };

  /* ===================== FILTRO ===================== */
  const filteredUbicaciones = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    return ubicaciones.filter((u) => {
      const nom = String(u.nombre_ubicacion || "").toLowerCase();
      const est = String(u.estado_ubicacion || "").toLowerCase();
      return nom.includes(q) || est.includes(q);
    });
  }, [ubicaciones, searchTerm]);

  /* ===================== UI ===================== */
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-4"></div>
          <p className="text-lg">Cargando ubicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-accent">Ubicaciones de Almacenes</h2>
          <p className="text-muted">Administra las ubicaciones y su estado</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setEditingNombre(null); // por si estabas editando una fila
            setFormData({ nombre_ubicacion: "", estado_ubicacion: "Con espacio" });
          }}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Ubicación
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
          <h3 className="text-xl font-semibold mb-4 text-white">Nueva Ubicación</h3>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre de Ubicación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre_ubicacion"
                  value={formData.nombre_ubicacion}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  name="estado_ubicacion"
                  value={formData.estado_ubicacion}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setFormData({ nombre_ubicacion: "", estado_ubicacion: "Con espacio" });
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
            placeholder="Buscar por nombre o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      {/* Tarjetas */}
<div className="bg-gray-800 rounded-lg">
  {filteredUbicaciones.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {filteredUbicaciones.map((u) => {
        const isRowEditing = String(editingNombre) === String(u.nombre_ubicacion);

        const valEstado =
          isRowEditing && rowEdit.estado_ubicacion !== undefined
            ? rowEdit.estado_ubicacion
            : u.estado_ubicacion || "Con espacio";

        return (
          <div
            key={u.nombre_ubicacion}
            className="bg-card border border-gray-700 rounded-xl p-5 shadow-md flex flex-col gap-4"
          >
            {/* Encabezado */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {u.nombre_ubicacion}
                </h3>
                {!isRowEditing && (
                    <p className="text-sm text-gray-400 mt-1">
                      Ubicación de almacén
                    </p>
                )}
              </div>

              {/* Estado (chip o select si está editando) */}
              {!isRowEditing ? (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    (u.estado_ubicacion || "").toLowerCase() === "ocupada"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                  title="Estado"
                >
                  {u.estado_ubicacion}
                </span>
              ) : (
                <select
                  value={valEstado}
                  onChange={(e) =>
                    onRowChange("estado_ubicacion", e.target.value)
                  }
                  className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-2">
              {isRowEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => saveEdit(u.nombre_ubicacion)}
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
                    onClick={() => startEdit(u)}
                    className="text-blue-400 hover:text-blue-300"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => requestDelete(u)}
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
          ? "No se encontraron ubicaciones que coincidan con la búsqueda."
          : "No hay ubicaciones registradas. Comienza agregando una nueva."}
      </p>
      {!searchTerm && !isAdding && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="mt-4 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Ubicación
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
              <h4 className="text-lg font-semibold text-white">Eliminar ubicación</h4>
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
              ¿Seguro que deseas eliminar la ubicación{" "}
              <span className="font-semibold text-white">
                {ubicacionToDelete?.nombre_ubicacion}
              </span>
              ? Esta acción no se puede deshacer.
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

export default UbicacionesAlmacenes;
