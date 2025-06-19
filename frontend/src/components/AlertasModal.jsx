import Modal from "./Modal";

function AlertasModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚠️ Alertas del Sistema">
      <div className="bg-yellow-100 p-4 rounded-md text-yellow-800">
        <p>Hay procesos pendientes de revisión. Revisa las alertas antes de continuar.</p>
      </div>
    </Modal>
  );
}

export default AlertasModal;
