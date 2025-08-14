import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, X, Save } from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:3000/api/devolucion",
  headers: { "Content-Type": "application/json" },
});

// helpers
const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const notEmpty = (s) => String(s ?? "").trim().length > 0;

function Devoluciones() {
  const [devoluciones, setDevoluciones] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // edición en línea (en la tabla)
  const [editingId, setEditingId] = useState(null); // codigo_devolucion en edición
  const [rowEdit, setRowEdit] = useState({}); // parcial: solo lo que cambia el usuario

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [devolucionToDelete, setDevolucionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form de creación
  const [formData, setFormData] = useState({
    codigo_devolucion: "",
    fecha_devolucion: toDateInput(new Date()),
    motivo_devolucion: "",
    codigo_factura: "",
    codigo_producto: "",
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

  // Cargar devoluciones
  useEffect(() => {
    fetchDevoluciones();
  }, []);

  const fetchDevoluciones = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/");
      setDevoluciones(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error al obtener devoluciones:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al obtener las devoluciones"
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
    if (!notEmpty(formData.codigo_devolucion))
      return setError("El código de devolución es obligatorio"), false;
    if (!notEmpty(formData.fecha_devolucion))
      return setError("La fecha de devolución es obligatoria"), false;
    if (!notEmpty(formData.motivo_devolucion))
      return setError("El motivo de la devolución es obligatorio"), false;
    if (!notEmpty(formData.codigo_factura))
      return setError("El código de factura es obligatorio"), false;
    if (!notEmpty(formData.codigo_producto))
      return setError("El código de producto es obligatorio"), false;
    return true;
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateCreate()) return clearMessagesLater();

    // payload según tu API
    const payload = {
      codigo_devolucion: String(formData.codigo_devolucion).trim(),
      fecha_devolucion: formData.fecha_devolucion,
      motivo_devolucion: String(formData.motivo_devolucion).trim(),
      codigo_factura: String(formData.codigo_factura).trim(),
      codigo_producto: String(formData.codigo_producto).trim(),
    };

    try {
      setSaving(true);
      await api.post("/", payload); // el backend suma +1 al stock
      setSuccess("Devolución registrada correctamente");
      await fetchDevoluciones();
      setFormData({
        codigo_devolucion: "",
        fecha_devolucion: toDateInput(new Date()),
        motivo_devolucion: "",
        codigo_factura: "",
        codigo_producto: "",
      });
      setIsAdding(false);
    } catch (err) {
      console.error("Error al crear devolución:", err);
      setError(
        err.response?.data?.details ||
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al guardar la devolución"
      );
    } finally {
      setSaving(false);
      clearMessagesLater();
    }
  };

  /* ===================== EDITAR EN LÍNEA ===================== */
  const startEdit = (d) => {
    // cerrar el form de creación para que los botones no disparen su submit
    setIsAdding(false);
    // limpiar cambios parciales e indicar fila en edición
    setRowEdit({});
    setEditingId(String(d.codigo_devolucion));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRowEdit({});
  };

  // Inputs en la fila: guardan SOLO el campo modificado
  const onRowChange = (field, value) => {
    setRowEdit((prev) => ({ ...prev, [field]: value }));
  };

  // Guardar: fusiona lo editado con lo original y manda todo lo que exige tu API
  const saveEdit = async (codigoDevolucion) => {
    const idStr = String(codigoDevolucion);
    const original = devoluciones.find(
      (x) => String(x.codigo_devolucion) === idStr
    );
    if (!original) return;

    const merged = {
      fecha_devolucion:
        rowEdit.fecha_devolucion !== undefined
          ? rowEdit.fecha_devolucion
          : toDateInput(original.fecha_devolucion),
      motivo_devolucion:
        rowEdit.motivo_devolucion !== undefined
          ? rowEdit.motivo_devolucion
          : original.motivo_devolucion,
      codigo_factura:
        rowEdit.codigo_factura !== undefined
          ? rowEdit.codigo_factura
          : original.codigo_factura,
      codigo_producto:
        rowEdit.codigo_producto !== undefined
          ? rowEdit.codigo_producto
          : original.codigo_producto,
    };

    // Validaciones (aunque solo cambies un campo)
    if (!notEmpty(merged.fecha_devolucion))
      return setError("La fecha de devolución es obligatoria"), clearMessagesLater();
    if (!notEmpty(merged.motivo_devolucion))
      return setError("El motivo de la devolución es obligatorio"), clearMessagesLater();
    if (!notEmpty(merged.codigo_factura))
      return setError("El código de factura es obligatorio"), clearMessagesLater();
    if (!notEmpty(merged.codigo_producto))
      return setError("El código de producto es obligatorio"), clearMessagesLater();

    try {
      setSaving(true);
      await api.put(`/${idStr}`, {
        fecha_devolucion: merged.fecha_devolucion,
        motivo_devolucion: merged.motivo_devolucion.trim(),
        codigo_factura: String(merged.codigo_factura).trim(),
        codigo_producto: String(merged.codigo_producto).trim(),
      });
      setSuccess("Devolución actualizada correctamente");
      await fetchDevoluciones();
      cancelEdit();
    } catch (err) {
      console.error("Error al actualizar devolución:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al actualizar la devolución"
      );
      clearMessagesLater();
    } finally {
      setSaving(false);
    }
  };

  /* ===================== ELIMINAR ===================== */
  const requestDelete = (d) => {
    setDevolucionToDelete(d);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!devolucionToDelete?.codigo_devolucion) return;
    try {
      setDeleting(true);
      await api.delete(`/${devolucionToDelete.codigo_devolucion}`);
      setSuccess("Devolución eliminada correctamente");
      await fetchDevoluciones();
    } catch (err) {
      console.error("Error al eliminar devolución:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al eliminar la devolución"
      );
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDevolucionToDelete(null);
      clearMessagesLater();
    }
  };

  /* ===================== FILTRO ===================== */
  const filteredDevoluciones = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    return devoluciones.filter((d) => {
      const cod = String(d.codigo_devolucion || "").toLowerCase();
      const mot = String(d.motivo_devolucion || "").toLowerCase();
      const fac = String(d.codigo_factura || "").toLowerCase();
      const pro = String(d.codigo_producto || "").toLowerCase();
      return (
        cod.includes(q) || mot.includes(q) || fac.includes(q) || pro.includes(q)
      );
    });
  }, [devoluciones, searchTerm]);

  /* ===================== UI ===================== */
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-4"></div>
          <p className="text-lg">Cargando devoluciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-accent">Historial de Devoluciones</h2>
          <p className="text-muted">Administra las devoluciones registradas</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setEditingId(null); // por si estabas editando una fila
            setFormData({
              codigo_devolucion: "",
              fecha_devolucion: toDateInput(new Date()),
              motivo_devolucion: "",
              codigo_factura: "",
              codigo_producto: "",
            });
          }}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Devolución
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
          <h3 className="text-xl font-semibold mb-4 text-white">Nueva Devolución</h3>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Código Devolución <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="codigo_devolucion"
                  value={formData.codigo_devolucion}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Ej: DEV-0001"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Debe ser único. Al crear, el stock del producto aumenta en 1.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fecha de Devolución <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_devolucion"
                  value={formData.fecha_devolucion}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Código Factura <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="codigo_factura"
                  value={formData.codigo_factura}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Ej: FAC-2025-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Código Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="codigo_producto"
                  value={formData.codigo_producto}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Ej: PROD-123"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Motivo <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="motivo_devolucion"
                  value={formData.motivo_devolucion}
                  onChange={handleInputChangeCreate}
                  rows="2"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Describe el motivo de la devolución"
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
                    codigo_devolucion: "",
                    fecha_devolucion: toDateInput(new Date()),
                    motivo_devolucion: "",
                    codigo_factura: "",
                    codigo_producto: "",
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
            placeholder="Buscar por código, motivo, factura o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
        {filteredDevoluciones.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Factura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredDevoluciones.map((d) => {
                  const isRowEditing = String(editingId) === String(d.codigo_devolucion);

                  // valores con fallback: al entrar a editar NO aparecen vacíos
                  const valFecha =
                    isRowEditing && rowEdit.fecha_devolucion !== undefined
                      ? rowEdit.fecha_devolucion
                      : toDateInput(d.fecha_devolucion);
                  const valMotivo =
                    isRowEditing && rowEdit.motivo_devolucion !== undefined
                      ? rowEdit.motivo_devolucion
                      : d.motivo_devolucion || "";
                  const valFactura =
                    isRowEditing && rowEdit.codigo_factura !== undefined
                      ? rowEdit.codigo_factura
                      : d.codigo_factura || "";
                  const valProducto =
                    isRowEditing && rowEdit.codigo_producto !== undefined
                      ? rowEdit.codigo_producto
                      : d.codigo_producto || "";

                  return (
                    <tr key={d.codigo_devolucion} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {d.codigo_devolucion}
                      </td>

                      {/* Fecha */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isRowEditing ? (
                          <input
                            type="date"
                            value={valFecha}
                            onChange={(e) => onRowChange("fecha_devolucion", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          <div className="text-sm text-gray-300">
                            {toDateInput(d.fecha_devolucion)}
                          </div>
                        )}
                      </td>

                      {/* Motivo */}
                      <td className="px-6 py-4">
                        {isRowEditing ? (
                          <input
                            type="text"
                            value={valMotivo}
                            onChange={(e) => onRowChange("motivo_devolucion", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          <div className="text-sm text-gray-300">{d.motivo_devolucion}</div>
                        )}
                      </td>

                      {/* Factura */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isRowEditing ? (
                          <input
                            type="text"
                            value={valFactura}
                            onChange={(e) => onRowChange("codigo_factura", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          <div className="text-sm text-gray-300">{d.codigo_factura}</div>
                        )}
                      </td>

                      {/* Producto */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isRowEditing ? (
                          <input
                            type="text"
                            value={valProducto}
                            onChange={(e) => onRowChange("codigo_producto", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          <div className="text-sm text-gray-300">{d.codigo_producto}</div>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isRowEditing ? (
                          <div className="flex justify-end gap-3">
                            <button
                              type="button" // evita submit del form de creación
                              onClick={() => saveEdit(d.codigo_devolucion)}
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
                          </div>
                        ) : (
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => startEdit(d)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDelete(d)}
                              className="text-red-400 hover:text-red-300"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {searchTerm
                ? "No se encontraron devoluciones que coincidan con la búsqueda."
                : "No hay devoluciones registradas. Comienza agregando una nueva devolución."}
            </p>
            {!searchTerm && !isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="mt-4 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Nueva Devolución
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
              <h4 className="text-lg font-semibold text-white">Eliminar devolución</h4>
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
              ¿Seguro que deseas eliminar la devolución{" "}
              <span className="font-semibold text-white">
                {devolucionToDelete?.codigo_devolucion}
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

export default Devoluciones;
