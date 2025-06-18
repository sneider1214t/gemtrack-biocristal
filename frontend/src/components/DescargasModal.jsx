import Modal from "./Modal";
import { Download, Plus } from "lucide-react";

function DescargasModal({ onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="bg-card p-6 rounded-xl text-white shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-accent">📥 Descargas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-medium mb-2">Reportes Disponibles</h3>
            <div className="space-y-2">
              <button className="text-sm text-accent hover:text-white">
                Reporte de Ventas
              </button>
              <button className="text-sm text-accent hover:text-white">
                Reporte de Stock
              </button>
              <button className="text-sm text-accent hover:text-white">
                Reporte de Proveedores
              </button>
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-medium mb-2">Historial de Descargas</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">
                Reporte Ventas - 2025-06-18
              </div>
              <div className="text-sm text-gray-400">
                Reporte Stock - 2025-06-17
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

export default DescargasModal;
