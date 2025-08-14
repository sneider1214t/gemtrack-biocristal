import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, X, Save } from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:3000/api/proveedores",
  headers: { "Content-Type": "application/json" },
});

// helpers
const digitsOnly = (s) => (s ?? "").replace(/\D/g, "");
const clampN = (s, n = 10) => digitsOnly(s).slice(0, n); 
const emailValid = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s ?? "").trim());

function Providers() {
  const [proveedores, setProveedores] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // edición en línea (en la tabla)
  const [editingId, setEditingId] = useState(null); // nit_proveedor en edición
  const [rowEdit, setRowEdit] = useState({}); // parcial: solo lo que cambia el usuario

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [proveedorToDelete, setProveedorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form de creación
  const [formData, setFormData] = useState({
    nit_proveedor: "",
    nombre_proveedor: "",
    direccion_proveedor: "",
    email_proveedor: "",
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

  // Cargar proveedores
  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/");
      setProveedores(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al obtener los proveedores"
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
    if (name === "nit_proveedor") {
      setFormData((p) => ({ ...p, nit_proveedor: clampN(value) }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validateCreate = () => {
    const nit = clampN(formData.nit_proveedor);
    if (!nit) return setError("El NIT es obligatorio"), false;
    if (!formData.nombre_proveedor.trim())
      return setError("El nombre es obligatorio"), false;
    if (!formData.direccion_proveedor.trim())
      return setError("La dirección es obligatoria"), false;
    if (!emailValid(formData.email_proveedor))
      return setError("Correo electrónico inválido"), false;
    return true;
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateCreate()) return clearMessagesLater();

    const payload = {
      nit_proveedor: clampN(formData.nit_proveedor),
      nombre_proveedor: formData.nombre_proveedor.trim(),
      direccion_proveedor: formData.direccion_proveedor.trim(),
      email_proveedor: formData.email_proveedor.trim().toLowerCase(),
    };

    try {
      setSaving(true);
      await api.post("/", payload);
      setSuccess("Proveedor registrado correctamente");
      await fetchProveedores();
      setFormData({
        nit_proveedor: "",
        nombre_proveedor: "",
        direccion_proveedor: "",
        email_proveedor: "",
      });
      setIsAdding(false);
    } catch (err) {
      console.error("Error al crear proveedor:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al guardar el proveedor"
      );
    } finally {
      setSaving(false);
      clearMessagesLater();
    }
  };

  /* ===================== EDITAR EN LÍNEA ===================== */
  const startEdit = (p) => {
    // cerrar el form de creación para que los botones no disparen su submit
    setIsAdding(false);
    // limpiar cambios parciales e indicar fila en edición
    setRowEdit({});
    setEditingId(String(p.nit_proveedor));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRowEdit({});
  };

  // Inputs en la fila: guardan SOLO el campo modificado
  const onRowChange = (field, value) => {
    setRowEdit((prev) => ({ ...prev, [field]: value }));
  };

  // Guardar: fusiona lo editado con lo original y manda todo lo requerido por la API
  const saveEdit = async (nit) => {
    const idStr = String(nit);
    const original = proveedores.find((x) => String(x.nit_proveedor) === idStr);
    if (!original) return;

    const merged = {
      nombre_proveedor:
        rowEdit.nombre_proveedor !== undefined
          ? rowEdit.nombre_proveedor
          : original.nombre_proveedor,
      direccion_proveedor:
        rowEdit.direccion_proveedor !== undefined
          ? rowEdit.direccion_proveedor
          : original.direccion_proveedor,
      email_proveedor:
        rowEdit.email_proveedor !== undefined
          ? rowEdit.email_proveedor
          : original.email_proveedor,
    };

    // Validaciones sobre la fusión (aunque solo cambies un campo)
    if (!merged.nombre_proveedor.trim())
      return setError("El nombre es obligatorio"), clearMessagesLater();
    if (!merged.direccion_proveedor.trim())
      return setError("La dirección es obligatoria"), clearMessagesLater();
    if (!emailValid(merged.email_proveedor))
      return setError("Correo electrónico inválido"), clearMessagesLater();

    try {
      setSaving(true);
      await api.put(`/${idStr}`, {
        nombre_proveedor: merged.nombre_proveedor.trim(),
        direccion_proveedor: merged.direccion_proveedor.trim(),
        email_proveedor: merged.email_proveedor.trim().toLowerCase(),
      });
      setSuccess("Proveedor actualizado correctamente");
      await fetchProveedores();
      cancelEdit();
    } catch (err) {
      console.error("Error al actualizar proveedor:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al actualizar el proveedor"
      );
      clearMessagesLater();
    } finally {
      setSaving(false);
    }
  };

  /* ===================== ELIMINAR ===================== */
  const requestDelete = (p) => {
    setProveedorToDelete(p);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!proveedorToDelete?.nit_proveedor) return;
    try {
      setDeleting(true);
      await api.delete(`/${proveedorToDelete.nit_proveedor}`);
      setSuccess("Proveedor eliminado correctamente");
      await fetchProveedores();
    } catch (err) {
      console.error("Error al eliminar proveedor:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al eliminar el proveedor"
      );
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setProveedorToDelete(null);
      clearMessagesLater();
    }
  };

  /* ===================== FILTRO ===================== */
  const filteredProveedores = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    return proveedores.filter((p) => {
      const nit = String(p.nit_proveedor || "").toLowerCase();
      const nom = String(p.nombre_proveedor || "").toLowerCase();
      const dir = String(p.direccion_proveedor || "").toLowerCase();
      const em = String(p.email_proveedor || "").toLowerCase();
      return nit.includes(q) || nom.includes(q) || dir.includes(q) || em.includes(q);
    });
  }, [proveedores, searchTerm]);

  /* ===================== UI ===================== */
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-4"></div>
          <p className="text-lg">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-accent">Gestión de Proveedores</h2>
          <p className="text-muted">Administra los proveedores registrados en el sistema</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setEditingId(null); // por si estabas editando una fila
            setFormData({
              nit_proveedor: "",
              nombre_proveedor: "",
              direccion_proveedor: "",
              email_proveedor: "",
            });
          }}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Proveedor
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
          <h3 className="text-xl font-semibold mb-4 text-white">Nuevo Proveedor</h3>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  NIT <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nit_proveedor"
                  value={formData.nit_proveedor}
                  onChange={handleInputChangeCreate}
                  maxLength={15}
                  inputMode="numeric"
                  pattern="\d*"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Solo números, máximo 10 dígitos.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre_proveedor"
                  value={formData.nombre_proveedor}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="direccion_proveedor"
                  value={formData.direccion_proveedor}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email_proveedor"
                  value={formData.email_proveedor}
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
                    nit_proveedor: "",
                    nombre_proveedor: "",
                    direccion_proveedor: "",
                    email_proveedor: "",
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
            placeholder="Buscar por NIT, nombre, email o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
        {filteredProveedores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">NIT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Dirección</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredProveedores.map((p) => {
                  const isRowEditing = String(editingId) === String(p.nit_proveedor);

                  // valores con fallback: al entrar a editar NO aparecen vacíos
                  const valNombre =
                    isRowEditing && rowEdit.nombre_proveedor !== undefined
                      ? rowEdit.nombre_proveedor
                      : p.nombre_proveedor || "";
                  const valDireccion =
                    isRowEditing && rowEdit.direccion_proveedor !== undefined
                      ? rowEdit.direccion_proveedor
                      : p.direccion_proveedor || "";
                  const valEmail =
                    isRowEditing && rowEdit.email_proveedor !== undefined
                      ? rowEdit.email_proveedor
                      : p.email_proveedor || "";

                  return (
                    <tr key={p.nit_proveedor} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{p.nit_proveedor}</td>

                      {/* Nombre */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isRowEditing ? (
                          <input
                            type="text"
                            value={valNombre}
                            onChange={(e) => onRowChange("nombre_proveedor", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          <div className="text-sm font-medium text-white">{p.nombre_proveedor}</div>
                        )}
                      </td>

                      {/* Dirección */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isRowEditing ? (
                          <input
                            type="text"
                            value={valDireccion}
                            onChange={(e) => onRowChange("direccion_proveedor", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          <div className="text-sm text-gray-300">{p.direccion_proveedor}</div>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isRowEditing ? (
                          <input
                            type="email"
                            value={valEmail}
                            onChange={(e) => onRowChange("email_proveedor", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          <div className="text-sm text-gray-300">{p.email_proveedor}</div>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isRowEditing ? (
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => saveEdit(p.nit_proveedor)}
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
                              onClick={() => startEdit(p)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDelete(p)}
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
                ? "No se encontraron proveedores que coincidan con la búsqueda."
                : "No hay proveedores registrados. Comienza agregando tu primer proveedor."}
            </p>
            {!searchTerm && !isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="mt-4 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Proveedor
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
              <h4 className="text-lg font-semibold text-white">Eliminar proveedor</h4>
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
              ¿Seguro que deseas eliminar al proveedor{" "}
              <span className="font-semibold text-white">
                {proveedorToDelete?.nombre_proveedor}
              </span>{" "}
              (NIT: {proveedorToDelete?.nit_proveedor})? Esta acción no se puede deshacer.
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

export default Providers;
