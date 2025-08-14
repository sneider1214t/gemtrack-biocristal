import { useNavigate } from "react-router-dom";

function Ingresos() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-background text-white px-4">
      <div className="bg-card p-8 rounded-2xl shadow-lg w-full max-w-2xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 bg-accent hover:bg-opacity-90 text-white px-4 py-2 rounded font-semibold"
        >
          ← Regresar
        </button>
        <h2 className="text-3xl font-bold text-accent mb-4">Reporte de Ingresos</h2>
        <p className="text-muted">
          Aquí se mostrarán los ingresos generados por ventas, servicios o entradas registradas en el sistema.
        </p>
        <div className="mt-6 p-4 bg-slate-800 rounded-lg shadow-inner">
          💡 Información simulada: $4.500.000 en el último mes.
        </div>
      </div>
    </div>
  );
}

export default Ingresos;
