import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Configuración de axios para la API
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

function Usuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    email_usuario: "",
    contraseña_usuario: "",
    rol_usuario: "empleado",
    telefono_usuario: "",
    direccion_usuario: "",
    estado_usuario: 1
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Obtener token y rol del localStorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.rol || '';
  
  console.log('Datos de usuario del localStorage:', { user, userRole });

  // Configurar interceptor para incluir el token en las peticiones
  useEffect(() => {
    const interceptor = api.interceptors.request.use(config => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      // Limpiar interceptor al desmontar el componente
      api.interceptors.request.eject(interceptor);
    };
  }, [token]);

  // Cargar usuarios
  const fetchUsers = async () => {
    console.log("Iniciando fetchUsers...");
    console.log("Token:", token ? "Presente" : "Ausente");
    console.log("Rol de usuario:", userRole);
    
    try {
      setLoading(true);
      console.log("Haciendo petición a /api/usuarios...");
      const response = await api.get("/usuarios");
      console.log("Respuesta recibida:", response);
      
      if (response.data) {
        console.log("Usuarios recibidos:", response.data);
        setUsers(response.data);
        setError(null);
      } else {
        console.error("La respuesta no contiene datos");
        setError("No se recibieron datos de usuarios");
        toast.error("No se pudieron cargar los usuarios. Inténtalo de nuevo más tarde.");
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      console.error("Detalles del error:", {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config
      });
      
      const errorMessage = error.response?.data?.message || "Error al cargar los usuarios";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al montar el componente si es administrador
  useEffect(() => {
    console.log("Efecto ejecutándose. Rol:", userRole);
    if (userRole && userRole.toLowerCase() === 'administrador') {
      console.log("Iniciando carga de usuarios...");
      fetchUsers();
    } else {
      console.log("Usuario no es administrador. No se cargarán los usuarios.");
      setLoading(false);
    }
  }, [userRole]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.nombre_usuario || !formData.email_usuario || (!editingUser && !formData.contraseña_usuario)) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email_usuario)) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }
    
    try {
      if (editingUser) {
        // Actualizar usuario existente
        const dataToUpdate = { ...formData };
        // No actualizar la contraseña si está vacía
        if (!dataToUpdate.contraseña_usuario) {
          delete dataToUpdate.contraseña_usuario;
        }
        await api.put(`/usuarios/${editingUser.id_usuario}`, dataToUpdate);
        toast.success("Usuario actualizado correctamente");
      } else {
        // Crear nuevo usuario
        await api.post("/usuarios", formData);
        toast.success("Usuario creado correctamente");
      }
      
      // Recargar lista de usuarios y limpiar formulario
      await fetchUsers();
      setFormData({
        nombre_usuario: "",
        email_usuario: "",
        contraseña_usuario: "",
        rol_usuario: "empleado",
        telefono_usuario: "",
        direccion_usuario: "",
        estado_usuario: 1
      });
      setEditingUser(null);
      setMostrarFormulario(false);
      
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      const errorMessage = error.response?.data?.message || "Error al guardar el usuario";
      toast.error(errorMessage.includes("duplicate") ? "El correo electrónico ya está en uso" : errorMessage);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nombre_usuario: user.nombre_usuario || "",
      email_usuario: user.email_usuario || "",
      contraseña_usuario: "", // No mostramos la contraseña por seguridad
      rol_usuario: user.rol_usuario || "empleado",
      telefono_usuario: user.telefono_usuario || "",
      direccion_usuario: user.direccion_usuario || "",
      estado_usuario: user.estado_usuario || 1
    });
    setMostrarFormulario(true);
    // Desplazarse al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await api.delete(`/usuarios/${id}`);
        toast.success("Usuario eliminado correctamente");
        await fetchUsers();
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        toast.error(error.response?.data?.message || "Error al eliminar el usuario");
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/usuarios/${user.id_usuario}`, {
        ...user,
        estado_usuario: user.estado_usuario === 1 ? 0 : 1
      });
      toast.success(`Usuario ${user.estado_usuario === 1 ? 'deshabilitado' : 'habilitado'} correctamente`);
      await fetchUsers();
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error);
      toast.error(error.response?.data?.message || "Error al cambiar el estado del usuario");
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background text-white p-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">Cargando usuarios...</p>
          <p className="text-sm text-gray-400 mt-2">Por favor, espera un momento</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full min-h-screen bg-background text-white p-8">
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Error al cargar los usuarios</h3>
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

  // Si el usuario no es administrador, mostrar mensaje
  if (!userRole || userRole.toLowerCase() !== 'administrador') {
    return (
      <div className="w-full min-h-screen bg-background text-white p-8">
        <div className="max-w-2xl mx-auto mt-20 p-6 bg-yellow-900/30 border border-yellow-700 rounded-lg">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Acceso restringido</h2>
          <p className="mb-4">No tienes permisos para acceder a esta sección.</p>
          <p className="text-sm text-gray-400">Contacta a un administrador si necesitas acceso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-accent">Gestión de Usuarios</h2>
        {userRole === 'administrador' && (
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({
                nombre_usuario: "",
                email_usuario: "",
                contraseña_usuario: "",
                rol_usuario: "empleado",
                telefono_usuario: "",
                direccion_usuario: "",
                estado_usuario: 1
              });
              setMostrarFormulario(!mostrarFormulario);
            }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
          >
            <span>➕</span>
            <span>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</span>
          </button>
        )}
      </div>

      {mostrarFormulario && (
        <div className="mb-8 bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">
            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
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
                <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
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
                  Contraseña {editingUser && '(dejar en blanco para no cambiar)'}
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
                  <option value="administrador">Administrador</option>
                  <option value="empleado">Empleado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="telefono_usuario"
                  value={formData.telefono_usuario}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input
                  type="text"
                  name="direccion_usuario"
                  value={formData.direccion_usuario}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>
              
              {editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    name="estado_usuario"
                    value={formData.estado_usuario}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                  >
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
              )}
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
                {editingUser ? 'Actualizar' : 'Crear'} Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto bg-card rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
              {userRole === 'administrador' && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.length > 0 ? (
              users.map((user, index) => {
                // Usar el índice como respaldo si el id_usuario no está definido
                const uniqueId = user.id_usuario !== undefined ? user.id_usuario : `temp-${index}`;
                return (
                  <tr key={`user-${uniqueId}`} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">{user.id_usuario || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.nombre_usuario || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email_usuario || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{user.rol_usuario || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.telefono_usuario || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.estado_usuario === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.estado_usuario === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {userRole && userRole.toLowerCase() === 'administrador' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-400 hover:text-blue-600"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={user.estado_usuario === 1 
                              ? "text-yellow-400 hover:text-yellow-600" 
                              : "text-green-400 hover:text-green-600"
                            }
                            title={user.estado_usuario === 1 ? 'Desactivar' : 'Activar'}
                          >
                            {user.estado_usuario === 1 ? '❌' : '✅'}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id_usuario)}
                            className="text-red-400 hover:text-red-600"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={userRole === 'administrador' ? 7 : 6} className="px-6 py-4 text-center text-gray-400">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {userRole !== 'administrador' && (
        <div className="mt-8 p-4 bg-yellow-900 bg-opacity-30 rounded-lg text-yellow-200">
          <p>No tienes permisos para administrar usuarios. Contacta a un administrador.</p>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
