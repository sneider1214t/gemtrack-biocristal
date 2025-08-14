import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Edit, Trash2, X, Save } from "lucide-react";

// Axios base
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// Helpers
const digitsOnly = (s) => (s ?? "").replace(/\D/g, "");
const clamp10 = (s) => digitsOnly(s).slice(0, 10);
const emailValid = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s ?? "").trim());
const normalizeRole = (r) => {
  const v = String(r || "").trim().toLowerCase();
  return v === "administrador" ? "Administrador" : "Empleado";
};

function Usuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Crear (form superior)
  const [isAdding, setIsAdding] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [createData, setCreateData] = useState({
    documento_usuario: "",
    nombre_usuario: "",
    email_usuario: "",
    contraseña_usuario: "",
    rol_usuario: "Empleado",
  });

  // Editar inline
  const [editingId, setEditingId] = useState(null); // documento_usuario
  const [rowEdit, setRowEdit] = useState({
    nombre_usuario: "",
    email_usuario: "",
    contraseña_usuario: "",
    rol_usuario: "Empleado",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Auth y permisos
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin =
    typeof user?.rol === "string" && user.rol.toLowerCase() === "administrador";

  // Interceptor token
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, [token]);

  // Cargar usuarios
  useEffect(() => {
    if (isAdmin) fetchUsers();
    else setLoading(false);
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/usuarios");
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Error al cargar los usuarios";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ============ CREAR (form superior) ============ */
  const onCreateChange = (e) => {
    const { name, value } = e.target;
    if (name === "documento_usuario") {
      setCreateData((p) => ({ ...p, documento_usuario: clamp10(value) }));
      return;
    }
    if (name === "rol_usuario") {
      setCreateData((p) => ({ ...p, rol_usuario: normalizeRole(value) }));
      return;
    }
    setCreateData((p) => ({ ...p, [name]: value }));
  };

  const validateCreate = () => {
    if (!createData.documento_usuario)
      return toast.error("Documento es requerido"), false;
    if (createData.documento_usuario.length > 10)
      return toast.error("El documento debe tener máximo 10 dígitos"), false;
    if (!createData.nombre_usuario.trim())
      return toast.error("El nombre es requerido"), false;
    if (!emailValid(createData.email_usuario))
      return toast.error("Correo inválido"), false;
    if (!createData.contraseña_usuario || createData.contraseña_usuario.length < 8)
      return toast.error("La contraseña debe tener al menos 8 caracteres"), false;
    if (!["Administrador", "Empleado"].includes(normalizeRole(createData.rol_usuario)))
      return toast.error("El rol debe ser Administrador o Empleado"), false;
    return true;
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    if (!validateCreate()) return;

    const payload = {
      documento_usuario: clamp10(createData.documento_usuario),
      nombre_usuario: createData.nombre_usuario.trim(),
      email_usuario: createData.email_usuario.trim().toLowerCase(),
      contraseña_usuario: createData.contraseña_usuario,
      rol_usuario: normalizeRole(createData.rol_usuario),
    };

    try {
      setSavingCreate(true);
      await api.post("/usuarios", payload);
      toast.success("Usuario creado");
      await fetchUsers();
      setCreateData({
        documento_usuario: "",
        nombre_usuario: "",
        email_usuario: "",
        contraseña_usuario: "",
        rol_usuario: "Empleado",
      });
      setIsAdding(false);
    } catch (err) {
      const m =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al guardar el usuario";
      toast.error(m.includes("duplicate") ? "El correo ya está en uso" : m);
    } finally {
      setSavingCreate(false);
    }
  };

  /* ============ EDITAR INLINE ============ */
  const startEdit = (u) => {
    setEditingId(u.documento_usuario);
    setRowEdit({
      nombre_usuario: u.nombre_usuario || "",
      email_usuario: u.email_usuario || "",
      contraseña_usuario: "",
      rol_usuario: normalizeRole(u.rol_usuario || "Empleado"),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRowEdit({
      nombre_usuario: "",
      email_usuario: "",
      contraseña_usuario: "",
      rol_usuario: "Empleado",
    });
  };

  const onRowChange = (field, value) => {
    if (field === "rol_usuario") {
      setRowEdit((p) => ({ ...p, rol_usuario: normalizeRole(value) }));
    } else {
      setRowEdit((p) => ({ ...p, [field]: value }));
    }
  };

  const validateEdit = () => {
    if (!rowEdit.nombre_usuario.trim())
      return toast.error("El nombre es requerido"), false;
    if (!emailValid(rowEdit.email_usuario))
      return toast.error("Correo inválido"), false;
    if (!["Administrador", "Empleado"].includes(normalizeRole(rowEdit.rol_usuario)))
      return toast.error("El rol debe ser Administrador o Empleado"), false;
    if (rowEdit.contraseña_usuario && rowEdit.contraseña_usuario.length < 8)
      return toast.error("La nueva contraseña debe tener al menos 8 caracteres"), false;
    return true;
  };

  const saveEdit = async (documento) => {
    if (!validateEdit()) return;
    const base = {
      nombre_usuario: rowEdit.nombre_usuario.trim(),
      email_usuario: rowEdit.email_usuario.trim().toLowerCase(),
      rol_usuario: normalizeRole(rowEdit.rol_usuario),
    };
    const payload = rowEdit.contraseña_usuario
      ? { ...base, contraseña_usuario: rowEdit.contraseña_usuario }
      : base;

    try {
      setSavingEdit(true);
      await api.put(`/usuarios/${documento}`, payload);
      toast.success("Usuario actualizado");
      await fetchUsers();
      cancelEdit();
    } catch (err) {
      const m =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al actualizar el usuario";
      toast.error(m);
    } finally {
      setSavingEdit(false);
    }
  };

  /* ============ ELIMINAR (MODAL) ============ */
  const requestDelete = (u) => {
    setUserToDelete(u);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!userToDelete?.documento_usuario) return;
    try {
      setDeleting(true);
      await api.delete(`/usuarios/${userToDelete.documento_usuario}`);
      toast.success("Usuario eliminado");
      await fetchUsers();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al eliminar"
      );
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  /* ============ UI ============ */
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background text-white p-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">Cargando usuarios...</p>
          <p className="text-sm text-gray-400 mt-2">Por favor, espera</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-background text-white p-8">
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Error al cargar</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen bg-background text-white p-8">
        <div className="max-w-2xl mx-auto mt-20 p-6 bg-yellow-900/30 border border-yellow-700 rounded-lg">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Acceso restringido</h2>
          <p className="mb-2">No tienes permisos para esta sección.</p>
          <p className="text-sm text-gray-400">Contacta a un administrador si necesitas acceso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-accent">Gestión de Usuarios</h2>
          <p className="text-muted">Administra los usuarios del sistema</p>
        </div>
        <button
          onClick={() => {
            setIsAdding((s) => !s);
            setCreateData({
              documento_usuario: "",
              nombre_usuario: "",
              email_usuario: "",
              contraseña_usuario: "",
              rol_usuario: "Empleado",
            });
            setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
          }}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {/* Formulario de creación */}
      {isAdding && (
        <div className="mb-8 bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Crear Nuevo Usuario</h3>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Documento</label>
                <input
                  type="text"
                  name="documento_usuario"
                  value={createData.documento_usuario}
                  onChange={onCreateChange}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="\d*"
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Solo números, máximo 10 dígitos.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre_usuario"
                  value={createData.nombre_usuario}
                  onChange={onCreateChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  name="email_usuario"
                  value={createData.email_usuario}
                  onChange={onCreateChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                  type="password"
                  name="contraseña_usuario"
                  value={createData.contraseña_usuario}
                  onChange={onCreateChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  name="rol_usuario"
                  value={createData.rol_usuario}
                  onChange={onCreateChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Empleado">Empleado</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingCreate}
                className="px-4 py-2 bg-accent hover:bg-accent/90 rounded-md text-white"
              >
                {savingCreate ? "Creando..." : "Crear Usuario"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla con edición inline */}
      <div className="overflow-x-auto bg-card rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Documento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contraseña (opcional)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.length > 0 ? (
              users.map((u) => {
                const isEditing = editingId === u.documento_usuario;
                return (
                  <tr key={`user-${u.documento_usuario}`} className="hover:bg-gray-800">
                    {/* Documento (no editable) */}
                    <td className="px-6 py-4 whitespace-nowrap">{u.documento_usuario || "-"}</td>

                    {/* Nombre */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={rowEdit.nombre_usuario}
                          onChange={(e) => onRowChange("nombre_usuario", e.target.value)}
                          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                        />
                      ) : (
                        u.nombre_usuario || "-"
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="email"
                          value={rowEdit.email_usuario}
                          onChange={(e) => onRowChange("email_usuario", e.target.value)}
                          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                        />
                      ) : (
                        u.email_usuario || "-"
                      )}
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={rowEdit.rol_usuario}
                          onChange={(e) => onRowChange("rol_usuario", e.target.value)}
                          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                        >
                          <option value="Administrador">Administrador</option>
                          <option value="Empleado">Empleado</option>
                        </select>
                      ) : (
                        normalizeRole(u.rol_usuario) || "-"
                      )}
                    </td>

                    {/* Nueva contraseña (opcional) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="password"
                          value={rowEdit.contraseña_usuario}
                          onChange={(e) => onRowChange("contraseña_usuario", e.target.value)}
                          placeholder="Nueva contraseña (opcional)"
                          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                        />
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isEditing ? (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => saveEdit(u.documento_usuario)}
                            className="text-green-400 hover:text-green-300"
                            title="Guardar"
                            disabled={savingEdit}
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-400 hover:text-gray-300"
                            title="Cancelar"
                            disabled={savingEdit}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => startEdit(u)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => requestDelete(u)}
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
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Eliminar usuario</h4>
              <button
                onClick={() => !deleting && setShowDeleteModal(false)}
                className="text-gray-400 hover:text-white"
                disabled={deleting}
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-300 mb-6">
              ¿Seguro que deseas eliminar a{" "}
              <span className="font-semibold text-white">{userToDelete?.nombre_usuario}</span>{" "}
              (Doc: {userToDelete?.documento_usuario})? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
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

export default Usuarios;
