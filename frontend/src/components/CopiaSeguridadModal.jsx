import Modal from "./Modal";

function CopiaSeguridadModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🛡 Copia de Seguridad">
      <div className="bg-blue-100 p-4 rounded-md text-blue-800">
        <p>Realiza una copia de seguridad de todos tus datos ahora.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Iniciar Backup</button>
      </div>
    </Modal>
  );
}

export default CopiaSeguridadModal;
