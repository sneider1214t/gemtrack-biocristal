import Modal from "./Modal";

function ContabilidadModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📊 Panel Contable">
      <div className="bg-gray-100 p-4 rounded-md text-gray-700">
        <p>Accede al estado financiero y controla ingresos/egresos.</p>
      </div>
    </Modal>
  );
}

export default ContabilidadModal;
