import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, X, Save } from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:3000/api/clientes",
  headers: { "Content-Type": "application/json" },
});

// helpers
const digitsOnly = (s) => (s ?? "").replace(/\D/g, "");
const clamp10 = (s) => digitsOnly(s).slice(0, 10);
const emailValid = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s ?? "").trim());

function Customers() {
  const [clientes, setClientes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // edición en línea (en la tabla)
  const [editingId, setEditingId] = useState(null); // documento_cliente en edición
  const [rowEdit, setRowEdit] = useState({}); // parcial: solo lo que cambia el usuario

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form de creación
  const [formData, setFormData] = useState({
    documento_cliente: "",
    nombre_cliente: "",
    email: "",
    telefono: "",
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

  // Cargar clientes
  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/");
      setClientes(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al obtener los clientes"
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
    if (name === "documento_cliente") {
      setFormData((p) => ({ ...p, documento_cliente: clamp10(value) }));
      return;
    }
    if (name === "telefono") {
      setFormData((p) => ({ ...p, telefono: clamp10(value) }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validateCreate = () => {
    const doc = clamp10(formData.documento_cliente);
    if (!doc) return setError("El documento es obligatorio"), false;
    if (doc.length > 10) return setError("Documento máximo 10 dígitos"), false;
    if (!formData.nombre_cliente.trim()) return setError("El nombre es obligatorio"), false;
    if (!emailValid(formData.email)) return setError("Correo electrónico inválido"), false;
    const tel = clamp10(formData.telefono);
    if (!tel) return setError("El teléfono es obligatorio"), false;
    if (tel.length > 10) return setError("Teléfono máximo 10 dígitos"), false;
    return true;
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateCreate()) return clearMessagesLater();

    const payload = {
      documento_cliente: clamp10(formData.documento_cliente),
      nombre_cliente: formData.nombre_cliente.trim(),
      email: formData.email.trim().toLowerCase(),
      telefono: clamp10(formData.telefono),
    };

    try {
      setSaving(true);
      await api.post("/", payload);
      setSuccess("Cliente registrado correctamente");
      await fetchClientes();
      setFormData({ documento_cliente: "", nombre_cliente: "", email: "", telefono: "" });
      setIsAdding(false);
    } catch (err) {
      console.error("Error al crear cliente:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al guardar el cliente"
      );
    } finally {
      setSaving(false);
      clearMessagesLater();
    }
  };

  /* ===================== EDITAR EN LÍNEA ===================== */
  const startEdit = (c) => {
    // cerrar el form de creación para que los botones no disparen su submit
    setIsAdding(false);
    // limpiar cambios parciales e indicar fila en edición
    setRowEdit({});
    setEditingId(String(c.documento_cliente));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRowEdit({});
  };

  // Inputs en la fila: guardan SOLO el campo modificado
  const onRowChange = (field, value) => {
    setRowEdit((prev) => {
      let v = value;
      if (field === "telefono") v = clamp10(value);
      return { ...prev, [field]: v };
    });
  };

  // Guardar: fusiona lo editado con lo original y manda todo lo requerido por la API
  const saveEdit = async (documento) => {
    const docStr = String(documento);
    const original = clientes.find((x) => String(x.documento_cliente) === docStr);
    if (!original) return;

    const merged = {
      nombre_cliente:
        rowEdit.nombre_cliente !== undefined ? rowEdit.nombre_cliente : original.nombre_cliente,
      email:
        rowEdit.email !== undefined ? rowEdit.email : original.email,
      telefono:
        rowEdit.telefono !== undefined ? clamp10(rowEdit.telefono) : clamp10(original.telefono || ""),
    };

    // Validaciones sobre la fusión (aunque solo cambies un campo)
    if (!merged.nombre_cliente.trim())
      return setError("El nombre es obligatorio"), clearMessagesLater();
    if (!emailValid(merged.email))
      return setError("Correo electrónico inválido"), clearMessagesLater();
    if (!merged.telefono)
      return setError("El teléfono es obligatorio"), clearMessagesLater();
    if (merged.telefono.length > 10)
      return setError("El teléfono debe tener máximo 10 dígitos"), clearMessagesLater();

    try {
      setSaving(true);
      await api.put(`/${docStr}`, {
        nombre_cliente: merged.nombre_cliente.trim(),
        email: merged.email.trim().toLowerCase(),
        telefono: merged.telefono,
      });
      setSuccess("Cliente actualizado correctamente");
      await fetchClientes();
      cancelEdit();
    } catch (err) {
      console.error("Error al actualizar cliente:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al actualizar el cliente"
      );
      clearMessagesLater();
    } finally {
      setSaving(false);
    }
  };

  /* ===================== ELIMINAR ===================== */
  const requestDelete = (c) => {
    setClienteToDelete(c);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!clienteToDelete?.documento_cliente) return;
    try {
      setDeleting(true);
      await api.delete(`/${clienteToDelete.documento_cliente}`);
      setSuccess("Cliente eliminado correctamente");
      await fetchClientes();
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al eliminar el cliente"
      );
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setClienteToDelete(null);
      clearMessagesLater();
    }
  };

  /* ===================== FILTRO ===================== */
  const filteredClientes = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    return clientes.filter((c) => {
      const doc = String(c.documento_cliente || "").toLowerCase();
      const nom = String(c.nombre_cliente || "").toLowerCase();
      const em = String(c.email || "").toLowerCase();
      const tel = String(c.telefono || "").toLowerCase();
      return doc.includes(q) || nom.includes(q) || em.includes(q) || tel.includes(q);
    });
  }, [clientes, searchTerm]);

  /* ===================== UI ===================== */
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-4"></div>
          <p className="text-lg">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-accent">Historial de Clientes</h2>
          <p className="text-muted">Administra los clientes registrados en el sistema</p>
        </div>
        <button
          type="button"  // importante para no disparar submit de otros forms
          onClick={() => {
            setIsAdding(true);
            setEditingId(null); // por si estabas editando una fila
            setFormData({ documento_cliente: "", nombre_cliente: "", email: "", telefono: "" });
          }}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Cliente
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
          <h3 className="text-xl font-semibold mb-4 text-white">Nuevo Cliente</h3>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Documento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="documento_cliente"
                  value={formData.documento_cliente}
                  onChange={handleInputChangeCreate}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="\d*"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Solo números, máximo 10 dígitos.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre_cliente"
                  value={formData.nombre_cliente}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChangeCreate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChangeCreate}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="\d*"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Solo números, máximo 10 dígitos.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setFormData({ documento_cliente: "", nombre_cliente: "", email: "", telefono: "" });
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
            placeholder="Buscar por documento, nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
        {filteredClientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredClientes.map((c) => {
                  const isRowEditing = String(editingId) === String(c.documento_cliente);

                  // valores con fallback: al entrar a editar NO aparecen vacíos
                  const valNombre =
                    isRowEditing && rowEdit.nombre_cliente !== undefined
                      ? rowEdit.nombre_cliente
                      : c.nombre_cliente || "";
                  const valEmail =
                    isRowEditing && rowEdit.email !== undefined
                      ? rowEdit.email
                      : c.email || "";
                  const valTelefono =
                    isRowEditing && rowEdit.telefono !== undefined
                      ? rowEdit.telefono
                      : String(c.telefono || "");

                  return (
                    <tr key={c.documento_cliente} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{c.documento_cliente}</td>

                      {/* Nombre */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isRowEditing ? (
                          <input
                            type="text"
                            value={valNombre}
                            onChange={(e) => onRowChange("nombre_cliente", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          <div className="text-sm font-medium text-white">{c.nombre_cliente}</div>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isRowEditing ? (
                          <input
                            type="email"
                            value={valEmail}
                            onChange={(e) => onRowChange("email", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          <div className="text-sm text-gray-300">{c.email}</div>
                        )}
                      </td>

                      {/* Teléfono */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isRowEditing ? (
                          <input
                            type="tel"
                            value={valTelefono}
                            onChange={(e) => onRowChange("telefono", e.target.value)}
                            maxLength={10}
                            inputMode="numeric"
                            pattern="\d*"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          <div className="text-sm text-gray-300">{c.telefono}</div>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isRowEditing ? (
                          <div className="flex justify-end gap-3">
                            <button
                              type="button" // evita submit del form de creación
                              onClick={() => saveEdit(c.documento_cliente)}
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
                ? "No se encontraron clientes que coincidan con la búsqueda."
                : "No hay clientes registrados. Comienza agregando tu primer cliente."}
            </p>
            {!searchTerm && !isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="mt-4 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Cliente
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
              <h4 className="text-lg font-semibold text-white">Eliminar cliente</h4>
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
              ¿Seguro que deseas eliminar al cliente{" "}
              <span className="font-semibold text-white">
                {clienteToDelete?.nombre_cliente}
              </span>{" "}
              (Doc: {clienteToDelete?.documento_cliente})? Esta acción no se puede deshacer.
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

export default Customers;
