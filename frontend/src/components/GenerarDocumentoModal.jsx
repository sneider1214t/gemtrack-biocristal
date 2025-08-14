import Modal from "./Modal";

function GenerarDocumentoModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📝 Generar Documento">
      <div className="bg-indigo-100 p-4 rounded-md text-indigo-800">
        <p>Selecciona el tipo de documento a generar (PDF, Excel, etc.).</p>
        <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">Generar</button>
      </div>
    </Modal>
  );
}

export default GenerarDocumentoModal;
