import Modal from "./Modal";

function OrdenesCompraModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📑 Órdenes de Compra">
      <div className="bg-lime-100 p-4 rounded-md text-lime-800">
        <p>Gestiona, edita o visualiza las órdenes de compra registradas.</p>
      </div>
    </Modal>
  );
}

export default OrdenesCompraModal;
