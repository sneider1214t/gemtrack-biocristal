import { useState } from "react";
import { useUserPool } from "../context/UserPoolContext"; // 👈 importa el contexto

// Simulamos el usuario logueado actual (esto deberías obtenerlo desde useAuth o similar)
const currentUser = {
  username: "admin",
  role: "administrador", // Cambia a "trabajador" para probar
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

      <div className="bg-card p-6 rounded-xl max-w-xl">
        <h3 className="text-lg font-semibold mb-4">Usuarios actuales</h3>
        <ul className="space-y-2 text-sm">
          {users.map((u, i) => (
            <li key={i} className="flex justify-between bg-gray-800 p-2 rounded">
              <span>{u.username}</span>
              <span className="text-gray-400">{u.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Usuarios;
