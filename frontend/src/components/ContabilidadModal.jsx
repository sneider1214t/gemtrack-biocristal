import Modal from "./Modal";
import { DollarSign, Plus } from "lucide-react";

function ContabilidadModal({ onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="bg-card p-6 rounded-xl text-white shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-accent">💰 Contabilidad</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Ingresos Totales</span>
              <span className="font-bold">$5,200.00</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Gastos Totales</span>
              <span className="font-bold">$2,800.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Ganancia Neta</span>
              <span className="font-bold text-accent">$2,400.00</span>
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-medium mb-2">Últimas Transacciones</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Venta #1234</span>
                <span className="text-sm">+$1,250.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Compra #5678</span>
                <span className="text-sm">-$850.00</span>
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

export default ContabilidadModal;
