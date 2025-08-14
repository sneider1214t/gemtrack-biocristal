import Modal from "./Modal";

function NivelesStockModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📦 Niveles de Stock">
      <div className="bg-red-100 p-4 rounded-md text-red-800">
        <p>Visualiza el inventario actual y niveles mínimos de reabastecimiento.</p>
      </div>
    </Modal>
  );
}

export default NivelesStockModal;
