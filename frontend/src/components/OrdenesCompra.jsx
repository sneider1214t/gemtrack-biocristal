function OrdenesCompra() {
  return (
    <div className="flex-1 p-8 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6">Órdenes de Compra</h2>
      <table className="w-full text-sm bg-card rounded-xl overflow-hidden">
        <thead className="bg-slate-800 text-left">
          <tr>
            <th className="p-3">Producto</th>
            <th className="p-3">Cantidad</th>
            <th className="p-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-700">
            <td className="p-3">Cuarzo Rosa</td>
            <td className="p-3">120</td>
            <td className="p-3 text-purple-400">Entregado</td>
          </tr>
          <tr className="border-t border-slate-700">
            <td className="p-3">Topacio Azul</td>
            <td className="p-3">50</td>
            <td className="p-3 text-yellow-400">Pendiente</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export default OrdenesCompra;
