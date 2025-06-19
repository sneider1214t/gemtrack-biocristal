import Modal from "./Modal";

function DescargasModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📥 Descargas Disponibles">
      <div className="bg-green-100 p-4 rounded-md text-green-800">
        <ul className="list-disc pl-5">
          <li>Informe mensual (PDF)</li>
          <li>Exportación de datos (CSV)</li>
        </ul>
      </div>
    </Modal>
  );
}

export default DescargasModal;
