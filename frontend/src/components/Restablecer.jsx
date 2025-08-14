import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:3000/api/usuarios",
  headers: { "Content-Type": "application/json" },
});

function Restablecer() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Contador visual de 5 minutos (300 s). Solo informativo: el backend valida.
  const [secondsLeft, setSecondsLeft] = useState(300);
  const mmss = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const validate = () => {
    if (!password || !password2) return setError("Completa ambos campos"), false;
    if (password.length < 8)
      return setError("La contraseña debe tener al menos 8 caracteres"), false;
    if (password !== password2) return setError("Las contraseñas no coinciden"), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Tu API: POST /reset-password/:token { nueva_contraseña }
      await api.post(`/reset-password/${token}`, {
        nueva_contraseña: password,
      });

      toast.success("Contraseña actualizada correctamente");
      navigate("/");
    } catch (err) {
      console.error("Error al restablecer:", err);
      if (err.response?.status === 400) {
        setError("El enlace es inválido o ha expirado. Solicita uno nuevo.");
      } else if (err.response?.status >= 500) {
        setError("Error en el servidor. Intenta más tarde.");
      } else {
        setError("No se pudo restablecer la contraseña. Inténtalo de nuevo.");
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

        <h2 className="text-center text-xl mb-2">Restablecer contraseña</h2>
        <p className="text-center text-gray-300 mb-2">
          Ingresa tu nueva contraseña. El enlace expira en 5 minutos.
        </p>
        <p className="text-center text-gray-400 mb-6">
          Tiempo restante (referencial): <b>{mmss}</b>
        </p>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input">
            <input
              type={show1 ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>Nueva contraseña</label>
            <button
              type="button"
              onClick={() => setShow1(!show1)}
              className="absolute right-3 top-3 text-white hover:text-accent"
            >
              {show1 ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="login-input">
            <input
              type={show2 ? "text" : "password"}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
            <label>Confirmar contraseña</label>
            <button
              type="button"
              onClick={() => setShow2(!show2)}
              className="absolute right-3 top-3 text-white hover:text-accent"
            >
              {show2 ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Restablecer contraseña"}
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

export default Restablecer;
