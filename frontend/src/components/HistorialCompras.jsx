import { useNavigate } from "react-router-dom";

function HistorialCompras() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-background text-white px-4">
      <div className="bg-card p-8 rounded-2xl shadow-lg w-full max-w-3xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 bg-accent hover:bg-opacity-90 text-white px-4 py-2 rounded font-semibold"
        >
          ← Regresar
        </button>
        <h2 className="text-3xl font-bold text-accent mb-4">Historial de Compras</h2>
        <p className="text-muted mb-4">Lista de compras realizadas por los usuarios:</p>
        <ul className="space-y-3">
          <li className="bg-slate-800 p-4 rounded-md">
            🟢 12/05/2025 - Rubí x 2g - $200.000
          </li>
          <li className="bg-slate-800 p-4 rounded-md">
            🟢 10/05/2025 - Zafiro x 1g - $90.000
          </li>
          <li className="bg-slate-800 p-4 rounded-md">
            🟡 09/05/2025 - Amatista x 3g - $225.000
          </li>
        </ul>
      </div>
    </div>
  );
}

export default HistorialCompras;
