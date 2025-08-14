import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

// API alineada con tu backend (router montado en /api/usuarios)
const api = axios.create({
  baseURL: "http://localhost:3000/api/usuarios",
  headers: { "Content-Type": "application/json" },
});

function Recuperar() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return setError("Por favor ingrese su correo");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError("Correo electrónico inválido");

    setIsLoading(true);
    setError("");

    try {
      // Tu API: POST /forgot-password { email_usuario }
      await api.post("/forgot-password", { email_usuario: email });

      toast.success(
        "Si el correo existe, te enviamos un enlace para restablecer tu contraseña."
      );
      navigate("/");
    } catch (err) {
      console.error("Error en recuperación:", err);
      if (err.response?.status >= 500) {
        setError("Error en el servidor. Intenta más tarde.");
      } else {
        // Por seguridad, tu API responde genérico: mantenemos mensaje amigable.
        setError(
          "Si el correo existe, te enviamos un enlace para restablecer tu contraseña."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h1 className="login-title">
          <span className="text-4xl">💎</span>
          <span className="ml-2">BioCristal</span>
        </h1>

        <h2 className="text-center text-xl mb-2">Recuperar contraseña</h2>
        <p className="text-center text-gray-300 mb-6">
          Ingresa tu correo para enviarte un enlace de recuperación.
        </p>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

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

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="forgot-password">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Recuperar;

