import Modal from "./Modal";
import { Tag, Plus } from "lucide-react";

function TiposModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📚 Tipos de Productos">
      <div className="bg-orange-100 p-4 rounded-md text-orange-800">
        <p>Define y categoriza tipos de productos en el sistema.</p>
      </div>
    </Modal>
  );
}

export default TiposModal;
