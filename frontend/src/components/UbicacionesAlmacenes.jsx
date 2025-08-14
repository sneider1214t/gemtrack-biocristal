function UbicacionesAlmacenes() {
  return (
    <div className="flex-1 p-8 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6">Ubicaciones de Almacenes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-xl shadow-md">
          <p className="text-lg">Bodega 1</p>
          <p className="text-muted">Medellín - Zona Norte</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-md">
          <p className="text-lg">Bodega 2</p>
          <p className="text-muted">Bogotá - Centro</p>
        </div>
      </div>
    </div>
  );
}
export default UbicacionesAlmacenes;