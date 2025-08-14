import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Configuración de axios para la API
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

function Usuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [formData, setFormData] = useState({
    documento_usuario: "",
    nombre_usuario: "",
    email_usuario: "",
    contraseña_usuario: "",
    rol_usuario: "Empleado", // Debe coincidir con API: "Administrador" | "Empleado"
  });

  // Token y rol desde localStorage
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin =
    typeof user?.rol === "string" &&
    user.rol.toLowerCase() === "administrador";

  // Interceptor para token
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, [token]);

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

  // Cargar si es admin
  useEffect(() => {
    if (isAdmin) fetchUsers();
    else setLoading(false);
  }, [isAdmin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      documento_usuario: "",
      nombre_usuario: "",
      email_usuario: "",
      contraseña_usuario: "",
      rol_usuario: "Empleado",
    });
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (
      !formData.documento_usuario &&
      !editingUser // documento no es editable, pero sí requerido al crear
    ) {
      toast.error("Documento es requerido");
      return;
    }
    if (!formData.nombre_usuario || !formData.email_usuario) {
      toast.error("Nombre y correo son requeridos");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email_usuario)) {
      toast.error("Correo inválido");
      return;
    }
    if (!editingUser && !formData.contraseña_usuario) {
      toast.error("La contraseña es requerida al crear");
      return;
    }

    try {
      if (editingUser) {
        // Actualizar: no enviar contraseña si está vacía
        const { contraseña_usuario, ...rest } = formData;
        const payload = contraseña_usuario
          ? { ...rest, contraseña_usuario }
          : { ...rest };
        await api.put(`/usuarios/${editingUser.documento_usuario}`, payload);
        toast.success("Usuario actualizado");
      } else {
        // Crear
        await api.post("/usuarios", formData);
        toast.success("Usuario creado");
      }

      await fetchUsers();
      resetForm();
      setMostrarFormulario(false);
    } catch (err) {
      const m =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al guardar el usuario";
      toast.error(m.includes("duplicate") ? "Correo ya está en uso" : m);
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u);
    setFormData({
      documento_usuario: u.documento_usuario || "",
      nombre_usuario: u.nombre_usuario || "",
      email_usuario: u.email_usuario || "",
      contraseña_usuario: "",
      rol_usuario: u.rol_usuario || "Empleado",
    });
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (documento) => {
    if (!documento) return;
    if (window.confirm("¿Eliminar este usuario?")) {
      try {
        await api.delete(`/usuarios/${documento}`);
        toast.success("Usuario eliminado");
        await fetchUsers();
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Error al eliminar"
        );
      }
    }
  };

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
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">
            Acceso restringido
          </h2>
          <p className="mb-2">No tienes permisos para esta sección.</p>
          <p className="text-sm text-gray-400">
            Contacta a un administrador si necesitas acceso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-accent">Gestión de Usuarios</h2>
        <button
          onClick={() => {
            if (editingUser) setEditingUser(null);
            resetForm();
            setMostrarFormulario((s) => !s);
          }}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
        >
          <span>➕</span>
          <span>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</span>
        </button>
      </div>

      {mostrarFormulario && (
        <div className="mb-8 bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">
            {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Documento
                  </label>
                  <input
                    type="text"
                    name="documento_usuario"
                    value={formData.documento_usuario}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre_usuario"
                  value={formData.nombre_usuario}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email_usuario"
                  value={formData.email_usuario}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Contraseña {editingUser && "(dejar vacío para no cambiar)"}
                </label>
                <input
                  type="password"
                  name="contraseña_usuario"
                  value={formData.contraseña_usuario}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  name="rol_usuario"
                  value={formData.rol_usuario}
                  onChange={handleInputChange}
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
                onClick={() => setMostrarFormulario(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                {editingUser ? "Actualizar" : "Crear"} Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto bg-card rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.length > 0 ? (
              users.map((u) => (
                <tr
                  key={`user-${u.documento_usuario}`}
                  className="hover:bg-gray-800"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.documento_usuario || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.nombre_usuario || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.email_usuario || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.rol_usuario || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleEdit(u)}
                        className="text-blue-400 hover:text-blue-600"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(u.documento_usuario)}
                        className="text-red-400 hover:text-red-600"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Usuarios;
