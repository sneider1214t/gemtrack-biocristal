// src/components/Alertas.jsx
import { AlertCircle, Package, PlusSquare, Warehouse, TrendingDown, X } from "lucide-react";
import { useState } from "react";

function Alertas() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="w-full min-h-screen bg-background flex justify-center items-center text-white p-8">
      <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl">
        {/* Encabezado */}
        <div className="flex justify-between items-center text-sky-400 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-yellow-400" />
            <h2 className="text-xl font-bold">Alertas</h2>
          </div>
          <button onClick={() => setVisible(false)} className="text-muted hover:text-red-400">
            <X />
          </button>
        </div>

        {/* Alerta 1 */}
        <div className="bg-background p-4 rounded-lg flex items-center gap-3 mb-3">
          <Package className="text-sky-400" />
          <span>
            El producto <strong>Granito Azul</strong> tiene stock bajo.
          </span>
          <button className="ml-auto bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 text-sm rounded-md">
            Realizar pedido automático
          </button>
        </div>

        {/* Alerta 2 */}
        <div className="bg-background p-4 rounded-lg flex items-center gap-3 mb-3">
          <PlusSquare className="text-sky-400" />
          <span>
            Nuevo producto añadido: <strong>Cuarzo Celestial</strong>.
          </span>
        </div>

        {/* Alerta 3 */}
        <div className="bg-background p-4 rounded-lg flex items-center gap-3 mb-3">
          <Warehouse className="text-sky-400" />
          <span>
            <strong>Ónix Negro</strong> ha sido registrado en la <strong>Bodega 2</strong>.
          </span>
        </div>

        {/* Alerta 4 */}
        <div className="bg-background p-4 rounded-lg flex items-center gap-3">
          <TrendingDown className="text-sky-400" />
          <span>
            El precio del <strong>Ámbar Dorado</strong> ha cambiado significativamente en el mercado.
          </span>
        </div>
      </div>
    </div>
  );
}

export default Alertas;
