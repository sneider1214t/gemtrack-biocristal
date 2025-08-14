function Contabilidad() {
  return (
    <div className="flex-1 p-8 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6">Contabilidad</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-purple-400 mb-2">Ingresos del mes</h3>
          <p className="text-2xl font-bold">$8.200.000</p>
          <p className="text-muted mt-1">Ventas totales registradas</p>
        </div>
        
        <div className="bg-card p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-red-400 mb-2">Egresos del mes</h3>
          <p className="text-2xl font-bold">$4.300.000</p>
          <p className="text-muted mt-1">Gastos operativos generales</p>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-lg col-span-full">
          <h3 className="text-xl font-semibold text-accent mb-2">Balance Neto</h3>
          <p className="text-2xl font-bold text-cyan-300">$3.900.000</p>
          <p className="text-muted mt-1">Resultado del mes</p>
        </div>
      </div>
    </div>
  );
}

export default Contabilidad;
