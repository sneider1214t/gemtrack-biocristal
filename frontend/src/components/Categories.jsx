// src/components/Categories.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, X, Save } from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:3000/api/categorias",
  headers: { "Content-Type": "application/json" },
});

function Categories() {
  const [categorias, setCategorias] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // edición en línea (en la tabla)
  const [editingId, setEditingId] = useState(null); // id_categoria en edición
  const [rowEdit, setRowEdit] = useState({}); // solo campos modificados (parcial)

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form de creación
  const [formData, setFormData] = useState({
    id_categoria: "",
    nombre_categoria: "",
  });

  // Interceptor de token (opcional)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const interceptor = api.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, []);

  // Cargar categorías
  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/");
      setCategorias(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error al obtener categorías:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al obtener las categorías"
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
    if (name === "id_categoria") {
      // Permite cualquier string (sin límite de longitud ni solo números)
      setFormData((p) => ({ ...p, id_categoria: value }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validateCreate = () => {
    if (!formData.id_categoria.trim())
      return setError("El ID de la categoría es obligatorio"), false;
    if (!formData.nombre_categoria.trim())
      return setError("El nombre de la categoría es obligatorio"), false;
    return true;
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateCreate()) return clearMessagesLater();

    const payload = {
      id_categoria: formData.id_categoria.trim(),
      nombre_categoria: formData.nombre_categoria.trim(),
    };

    try {
      setSaving(true);
      await api.post("/", payload);
      setSuccess("Categoría registrada correctamente");
      await fetchCategorias();
      setFormData({ id_categoria: "", nombre_categoria: "" });
      setIsAdding(false);
    } catch (err) {
      console.error("Error al crear categoría:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al guardar la categoría"
      );
    } finally {
      setSaving(false);
      clearMessagesLater();
    }
  };

  /* ===================== EDITAR EN LÍNEA ===================== */
  const startEdit = (c) => {
    setIsAdding(false); // por si está abierto el form de creación
    setRowEdit({});
    setEditingId(String(c.id_categoria));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRowEdit({});
  };

  // Inputs en la fila: guardan SOLO el campo modificado
  const onRowChange = (field, value) => {
    setRowEdit((prev) => ({ ...prev, [field]: value }));
  };

  // Guardar: fusiona lo editado con lo original
  const saveEdit = async (id) => {
    const idStr = String(id);
    const original = categorias.find((x) => String(x.id_categoria) === idStr);
    if (!original) return;

    const merged = {
      nombre_categoria:
        rowEdit.nombre_categoria !== undefined
          ? rowEdit.nombre_categoria
          : original.nombre_categoria,
    };

    if (!merged.nombre_categoria.trim())
      return setError("El nombre de la categoría es obligatorio"), clearMessagesLater();

    try {
      setSaving(true);
      await api.put(`/${encodeURIComponent(idStr)}`, {
        nombre_categoria: merged.nombre_categoria.trim(),
      });
      setSuccess("Categoría actualizada correctamente");
      await fetchCategorias();
      cancelEdit();
    } catch (err) {
      console.error("Error al actualizar categoría:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al actualizar la categoría"
      );
      clearMessagesLater();
    } finally {
      setSaving(false);
    }
  };

  /* ===================== ELIMINAR ===================== */
  const requestDelete = (c) => {
    setCatToDelete(c);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!catToDelete?.id_categoria) return;
    try {
      setDeleting(true);
      await api.delete(`/${encodeURIComponent(catToDelete.id_categoria)}`);
      setSuccess("Categoría eliminada correctamente");
      await fetchCategorias();
    } catch (err) {
      console.error("Error al eliminar categoría:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al eliminar la categoría"
      );
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setCatToDelete(null);
      clearMessagesLater();
    }
  };

  /* ===================== FILTRO ===================== */
  const filteredCategorias = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    return categorias.filter((c) => {
      const id = String(c.id_categoria || "").toLowerCase();
      const nom = String(c.nombre_categoria || "").toLowerCase();
      return id.includes(q) || nom.includes(q);
    });
  }, [categorias, searchTerm]);

  /* ===================== UI ===================== */
  if (loading) {
    return (
      <div className="flex-1 p-8 text-white bg-background min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-4"></div>
          <p className="text-lg">Cargando categorías...</p>
        </div>
      </div>
    );
    }

  return (
    <div className="flex-1 p-8 text-white bg-background min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-accent">Categorías</h1>
          <p className="text-muted">
            Administra las categorías registradas en el sistema
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ id_categoria: "", nombre_categoria: "" });
          }}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Categoría
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
          <h3 className="text-xl font-semibold mb-4 text-white">
            Nueva Categoría
          </h3>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ID de Categoría <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="id_categoria"
                  value={formData.id_categoria}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Ej: GEMA-01, 1001, cat-a, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre de Categoría <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre_categoria"
                  value={formData.nombre_categoria}
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
                  setFormData({ id_categoria: "", nombre_categoria: "" });
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
            placeholder="Buscar por ID o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
        {filteredCategorias.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredCategorias.map((c) => {
                  const isRowEditing = String(editingId) === String(c.id_categoria);

                  // valores con fallback para que al editar se vean los actuales
                  const valNombre =
                    isRowEditing && rowEdit.nombre_categoria !== undefined
                      ? rowEdit.nombre_categoria
                      : c.nombre_categoria || "";

                  return (
                    <tr key={c.id_categoria} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {c.id_categoria}
                      </td>

                      {/* Nombre */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isRowEditing ? (
                          <input
                            type="text"
                            value={valNombre}
                            onChange={(e) => onRowChange("nombre_categoria", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          <div className="text-sm font-medium text-white">
                            {c.nombre_categoria}
                          </div>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isRowEditing ? (
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => saveEdit(c.id_categoria)}
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
                              onClick={() => startEdit(c)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDelete(c)}
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
                ? "No se encontraron categorías que coincidan con la búsqueda."
                : "No hay categorías registradas. Comienza agregando tu primera categoría."}
            </p>
            {!searchTerm && !isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="mt-4 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Categoría
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
              <h4 className="text-lg font-semibold text-white">Eliminar categoría</h4>
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
              ¿Seguro que deseas eliminar la categoría{" "}
              <span className="font-semibold text-white">
                {catToDelete?.nombre_categoria}
              </span>{" "}
              (ID: {catToDelete?.id_categoria})? Esta acción no se puede deshacer.
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

export default Categories;
