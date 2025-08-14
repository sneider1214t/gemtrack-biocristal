function TiempoProducto() {
  return (
    <div className="flex-1 p-8 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6">Tiempo de Vida de Productos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { nombre: "Rubí", dias: 22 },
          { nombre: "Esmeralda", dias: 17 },
          { nombre: "Amatista", dias: 30 },
          { nombre: "Zafiro", dias: 25 },
          { nombre: "Cuarzo", dias: 19 },
        ].map((producto, i) => (
          <div key={i} className="bg-card p-5 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-cyan-300 mb-1">{producto.nombre}</h3>
            <p className="text-3xl font-bold text-purple-400">{producto.dias} días</p>
            <p className="text-muted text-sm mt-1">Promedio de duración en stock</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TiempoProducto;
