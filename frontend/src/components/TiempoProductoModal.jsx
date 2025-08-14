import Modal from "./Modal";
import { Clock, Plus } from "lucide-react";

function TiempoProductoModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⏱ Tiempo de Producto">
      <div className="bg-purple-100 p-4 rounded-md text-purple-700">
        <p>Consulta y gestiona el tiempo promedio de elaboración por producto.</p>
      </div>
    </Modal>
  );
}

export default TiempoProductoModal;
