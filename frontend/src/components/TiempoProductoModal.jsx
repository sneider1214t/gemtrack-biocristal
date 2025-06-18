import Modal from "./Modal";
import { Clock, Plus } from "lucide-react";

function TiempoProductoModal({ onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="bg-card p-6 rounded-xl text-white shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-accent">⏱️ Tiempo de Producto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-medium mb-2">Tiempo Promedio</h3>
            <div className="text-sm text-gray-400">Por producto: 3.5 días</div>
            <div className="text-sm text-gray-400">Por categoría: 4.2 días</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-medium mb-2">Alertas</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-accent" />
                <span className="text-sm">Producto A: +7 días</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-accent" />
                <span className="text-sm">Producto B: +5 días</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default TiempoProductoModal;
