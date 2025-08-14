function Descargas() {
  return (
    <div className="flex-1 p-8 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6">Descargas</h2>
      <div className="bg-card p-6 rounded-2xl shadow-xl">
        <p className="text-muted mb-4">Archivos disponibles para descargar:</p>
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
            <span>Informe de ventas - Abril 2025</span>
            <button className="bg-sky-600 hover:bg-sky-700 px-3 py-1 text-white text-sm rounded-md">Descargar</button>
          </li>
          <li className="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
            <span>Base de datos de clientes</span>
            <button className="bg-sky-600 hover:bg-sky-700 px-3 py-1 text-white text-sm rounded-md">Descargar</button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Descargas;
