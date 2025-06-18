import Modal from "./Modal";
import { Bell, Plus } from "lucide-react";

function AlertasModal({ onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="bg-card p-6 rounded-xl text-white shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-accent">🔔 Alertas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-md">
            <Bell size={18} className="text-accent" />
            <div>
              <h3 className="font-medium">Stock mínimo alcanzado</h3>
              <p className="text-sm text-gray-400">Gema: Rubí, Stock: 5 unidades</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-md">
            <Bell size={18} className="text-accent" />
            <div>
              <h3 className="font-medium">Fecha de vencimiento</h3>
              <p className="text-sm text-gray-400">Proveedor: ABC, Vence: 2025-06-30</p>
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

export default AlertasModal;
