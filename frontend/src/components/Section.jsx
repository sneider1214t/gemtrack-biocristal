import { Bell, DollarSign, Save, Clock, Download, Tag, BarChart, FileText, MapPin, ShoppingBag } from 'lucide-react';

function Section({ title, items, handleAlertas, handleContabilidad, handleCopiaSeguridad, handleTiempoProducto, handleDescargas, handleTipos, handleNivelesStock, handleGenerarDocumento, handleUbicacionesAlmacenes, handleRecordatorios, handleOrdenesCompra }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={
              item.label === "Alertas" ? handleAlertas :
              item.label === "Contabilidad" ? handleContabilidad :
              item.label === "Copia de seguridad" ? handleCopiaSeguridad :
              item.label === "Tiempo de producto" ? handleTiempoProducto :
              item.label === "Descargas" ? handleDescargas :
              item.label === "Tipos" ? handleTipos :
              item.label === "Niveles de stock" ? handleNivelesStock :
              item.label === "Generar documento" ? handleGenerarDocumento :
              item.label === "Ubicaciones almacenes" ? handleUbicacionesAlmacenes :
              item.label === "Recordatorios" ? handleRecordatorios :
              item.label === "Órdenes de compra" ? handleOrdenesCompra : undefined
            }
            className="flex flex-col items-center justify-center gap-2 p-4 hover:bg-gray-700 rounded-lg transition-all duration-300"
          >
            <item.icon size={24} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Section;
