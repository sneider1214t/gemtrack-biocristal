function Tipos() {
  return (
    <div className="flex-1 p-8 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6">Proveedores</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-xl shadow-xl">
          <h3 className="text-xl font-semibold text-blue-400 mb-2">Tipo A</h3>
          <p className="text-muted">Gemas preciosas convencionales</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-xl">
          <h3 className="text-xl font-semibold text-purple-400 mb-2">Tipo B</h3>
          <p className="text-muted">Gemas de colección limitada</p>
        </div>
      </div>
    </div>
  );
}
export default Tipos;