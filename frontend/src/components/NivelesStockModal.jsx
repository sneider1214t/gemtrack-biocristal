import Modal from "./Modal";
import { BarChart, Plus } from "lucide-react";

function NivelesStockModal({ onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="bg-card p-6 rounded-xl text-white shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-accent">📊 Niveles de Stock</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-medium mb-2">Alertas de Stock</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Rubí</span>
                <span className="text-sm text-accent">5/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Esmeralda</span>
                <span className="text-sm text-accent">8/15</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-medium mb-2">Configuración</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Umbral mínimo:</span>
                <span className="text-sm text-gray-400">5 unidades</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Alerta automática:</span>
                <span className="text-sm text-gray-400">Activada</span>
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

export default NivelesStockModal;
