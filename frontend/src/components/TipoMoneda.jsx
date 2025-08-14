import { useNavigate } from "react-router-dom";

function TipoMoneda() {
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
        <h2 className="text-3xl font-bold text-accent mb-4">Configuración de Tipo de Moneda</h2>
        <p className="text-muted mb-4">
          Selecciona o configura la moneda predeterminada del sistema.
        </p>
        <select className="bg-slate-700 p-3 rounded-lg text-white w-full">
          <option value="COP">Peso Colombiano (COP)</option>
          <option value="USD">Dólar Estadounidense (USD)</option>
          <option value="EUR">Euro (EUR)</option>
        </select>
      </div>
    </div>
  );
}

export default TipoMoneda;
