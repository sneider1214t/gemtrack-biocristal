import Modal from "./Modal";
import { Save, Plus } from "lucide-react";

function CopiaSeguridadModal({ onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="bg-card p-6 rounded-xl text-white shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-accent">💾 Copia de Seguridad</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-medium mb-2">Última Copia</h3>
            <div className="text-sm text-gray-400">Fecha: 2025-06-18 16:30</div>
            <div className="text-sm text-gray-400">Estado: Completada</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-medium mb-2">Configuración</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Ubicación:</span>
                <span className="text-sm text-gray-400">/backup/2025-06-18</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Frecuencia:</span>
                <span className="text-sm text-gray-400">Diaria</span>
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
          <button
            onClick={() => {
              // Simular creación de copia de seguridad
              alert('Copia de seguridad iniciada...');
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold"
          >
            Crear Copia
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CopiaSeguridadModal;
