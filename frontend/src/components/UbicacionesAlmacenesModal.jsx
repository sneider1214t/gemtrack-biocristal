import Modal from "./Modal";
import { MapPin, Plus } from "lucide-react";

function UbicacionesAlmacenesModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🏢 Ubicaciones de Almacenes">
      <div className="bg-teal-100 p-4 rounded-md text-teal-800">
        <p>Consulta la ubicación física y estado de cada almacén registrado.</p>
      </div>
    </Modal>
  );
}

export default UbicacionesAlmacenesModal;
