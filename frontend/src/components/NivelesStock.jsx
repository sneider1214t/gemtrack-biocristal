function NivelesStock() {
  return (
    <div className="flex-1 p-8 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6">Niveles de Stock</h2>
      <div className="space-y-4">
        <div className="bg-card p-4 rounded-xl shadow-xl flex justify-between">
          <span>Diamante</span>
          <span className="text-purple-400 font-bold">72 disponibles</span>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-xl flex justify-between">
          <span>Rubí</span>
          <span className="text-yellow-400 font-bold">12 disponibles</span>
        </div>
      </div>
    </div>
  );
}
export default NivelesStock;
