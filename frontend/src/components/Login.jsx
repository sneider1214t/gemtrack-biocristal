import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

// Configuración de axios para la API
const api = axios.create({
  baseURL: "http://localhost:3000/api/usuarios", // <— AHORA apuntas al recurso usuarios
  headers: { "Content-Type": "application/json" },
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!email || !password) {
      setError("Por favor ingrese su correo y contraseña");
      return;
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingrese un correo electrónico válido");
      return;
    }

    setIsLoading(true);
  setError("");

  try {
    // Llamar al endpoint correcto
    const response = await api.post("/login", {
      email_usuario: email,
      contraseña_usuario: password,
    });

    const { token, user } = response.data; // user = { documento, nombre, email, rol }

    // Guardar token y datos del usuario
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth", "true");
    localStorage.setItem("rol", user.rol); // <— usa 'rol', no 'rol_usuario'

    // Inyectar token en axios (opcional si tienes un interceptor global)
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Mensaje de bienvenida (usa 'nombre')
    toast.success(`¡Bienvenido, ${user.nombre}!`);

    // Redirigir (si necesitas separar por rol, compara con "Administrador")
    if (user.rol === "Administrador") {
      navigate("/dashboard");
    } else {
      navigate("/dashboard");
    }
  } catch (error) {
    console.error("Error de autenticación:", error);
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400) setError(data.message || "Datos de inicio de sesión incorrectos");
      else if (status === 401) setError("Correo o contraseña incorrectos");
      else if (status >= 500) setError("Error en el servidor. Por favor, intente más tarde.");
      else setError("Error al iniciar sesión. Por favor, verifique sus datos.");
    } else if (error.request) {
      setError("No se pudo conectar al servidor. Verifique su conexión a internet.");
    } else {
      setError("Ocurrió un error inesperado. Por favor, intente nuevamente.");
    }
  } finally {
    setIsLoading(false);
  }
  };

  return (
    <div className="login-wrapper">
      {/* Contenedor principal del login */}
      <div className="login-container">
        <h1 className="login-title">
          <span className="text-4xl">💎</span>
          <span className="ml-2">BioCristal</span>
        </h1>

        {error && (
          <div className="text-red-500 text-center mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Correo Electrónico</label>
          </div>

          <div className="login-input">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>Contraseña</label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-white hover:text-accent"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-right">
            <a
              href="/recuperar"
              className="forgot-password"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
