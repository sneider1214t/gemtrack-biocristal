import { useState } from "react";
import { useUserPool } from "../context/UserPoolContext"; // 👈 importa el contexto

// Simulamos el usuario logueado actual (esto deberías obtenerlo desde useAuth o similar)
const currentUser = {
  username: "admin",
  role: "administrador", // Cambia a "trabajador" para probar
};

// Estilos para el círculo de administrador
const adminCircleStyles = {
  base: 'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl',
  tooltip: 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white rounded text-xs whitespace-nowrap',
};

function Usuarios() {
  const { users, addUser } = useUserPool(); // 👈 accede a usuarios y función para agregar
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: "",
    password: "",
    role: "trabajador",
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleAddUser = () => {
    if (!nuevoUsuario.username || !nuevoUsuario.password) return;

    addUser(nuevoUsuario); // 👈 guarda temporalmente
    setNuevoUsuario({ username: "", password: "", role: "trabajador" });
    setMostrarFormulario(false);
  };

  return (
    <div className="w-full min-h-screen bg-background text-white p-8">
      <h2 className="text-3xl font-bold text-accent mb-6">Gestión de Usuarios</h2>

      {currentUser.role === "administrador" && (
        <div className="mb-6">
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
          >
            ➕ Añadir nuevo usuario
          </button>

          {mostrarFormulario && (
            <div className="mt-4 bg-card p-4 rounded-lg space-y-4 max-w-md">
              <input
                type="text"
                placeholder="Usuario"
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={nuevoUsuario.username}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, username: e.target.value })}
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={nuevoUsuario.password}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
              />
              <select
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={nuevoUsuario.role}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, role: e.target.value })}
              >
                <option value="trabajador">Trabajador</option>
              </select>

              <button
                onClick={handleAddUser}
                className="bg-accent hover:bg-opacity-90 px-4 py-2 rounded-lg font-semibold"
              >
                Guardar usuario
              </button>
            </div>
          )}
        </div>
      )}

      <div className="relative bg-card p-6 rounded-xl max-w-xl">
        <h3 className="text-lg font-semibold mb-4">Usuarios actuales</h3>
        <ul className="space-y-2 text-sm">
          {users.map((u, i) => (
            <li key={i} className="flex justify-between bg-gray-800 p-2 rounded">
              <span>{u.username}</span>
              <div className="relative">
                <span className={`px-2 py-1 rounded-full text-xs ${u.role === 'administrador' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
                  {u.role === 'administrador' ? 'ADMIN' : 'TRABAJADOR'}
                </span>
                {u.role === 'administrador' && (
                  <div 
                    className={`${adminCircleStyles.base} ${currentUser.role === 'administrador' ? 'ring-2 ring-purple-500/50' : ''}`}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.1)';
                    }}
                  >
                    <span>ADM</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Usuarios;
