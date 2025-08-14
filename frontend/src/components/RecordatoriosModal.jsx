import Modal from "./Modal";

function RecordatoriosModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⏰ Recordatorios Activos">
      <div className="bg-pink-100 p-4 rounded-md text-pink-800">
        <p>No olvides revisar tus tareas programadas y vencimientos.</p>
      </div>
    </Modal>
  );
}

export default RecordatoriosModal;
