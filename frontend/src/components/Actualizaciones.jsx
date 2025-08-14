function Actualizaciones() {
  return (
    <div className="w-full min-h-screen bg-background text-white p-8">
      <h2 className="text-3xl font-bold text-accent mb-6">
        Actualizaciones del Sistema
      </h2>

      <ul className="space-y-4 text-sm max-w-3xl">
        <li className="bg-slate-800 p-3 rounded-md flex items-start gap-2">
          ✅ <span>v1.5 - Se agregó módulo de ubicación de bodegas.</span>
        </li>
        <li className="bg-slate-800 p-3 rounded-md flex items-start gap-2">
          ✅ <span>v1.4 - Mejoras en el diseño del carrito y seguridad de rutas.</span>
        </li>
        <li className="bg-slate-800 p-3 rounded-md flex items-start gap-2">
          🛠️ <span>v1.3 - Correcciones menores en vistas y filtrado.</span>
        </li>
      </ul>
    </div>
  );
}

export default Actualizaciones;
