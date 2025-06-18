function Recordatorios() {
  return (
    <div className="flex-1 p-8 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6">Recordatorios</h2>
      <ul className="space-y-3">
        <li className="bg-card p-4 rounded-lg shadow flex justify-between">
          <span>Revisar stock de Zafiro</span>
          <span className="text-yellow-400">Pendiente</span>
        </li>
        <li className="bg-card p-4 rounded-lg shadow flex justify-between">
          <span>Actualizar precios del Cuarzo</span>
          <span className="text-purple-400">Completado</span>
        </li>
      </ul>
    </div>
  );
}
export default Recordatorios;
