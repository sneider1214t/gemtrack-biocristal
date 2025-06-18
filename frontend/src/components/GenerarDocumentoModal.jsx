import Modal from "./Modal";
import { FileText, Plus } from "lucide-react";

function GenerarDocumentoModal({ onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="bg-card p-6 rounded-xl text-white shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-accent">📄 Generar Documento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-medium mb-2">Tipos de Documentos</h3>
            <div className="space-y-2">
              <button className="text-sm text-accent hover:text-white">
                Factura
              </button>
              <button className="text-sm text-accent hover:text-white">
                Recibo
              </button>
              <button className="text-sm text-accent hover:text-white">
                Presupuesto
              </button>
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-medium mb-2">Configuración</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Formato:</span>
                <span className="text-sm text-gray-400">PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Idioma:</span>
                <span className="text-sm text-gray-400">Español</span>
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
              // Simular generación de documento
              alert('Documento generado exitosamente');
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold"
          >
            Generar
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default GenerarDocumentoModal;
