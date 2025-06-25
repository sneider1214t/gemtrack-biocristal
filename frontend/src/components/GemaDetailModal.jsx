import Modal from "./Modal";
import { Clock, Plus, DollarSign } from "lucide-react";
import { useState } from "react";
import ComparePricesModal from "./ComparePricesModal";

function GemaDetailModal({ isOpen, onClose, gem }) {
  const [isComparing, setIsComparing] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleComparePrices = () => {
    setIsCompareModalOpen(true);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="💎 Detalle de Gema">
        <div className="space-y-4">
          <div className="flex gap-4">
            <img
              src={gem.imagen || "/gemtrack-biocristal/img/zafiro.png"}
              alt={gem.name}
              className="w-64 h-64 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold neon-text mb-2">{gem.name}</h2>
              <p className="text-muted mb-2">{gem.descripcion}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted mb-1">💵 Precio por gramo:</p>
                  <p className="font-bold">${gem.precio}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">📦 Stock disponible:</p>
                  <p className="font-bold">{gem.stock}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-purple-100 p-4 rounded-md text-purple-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} />
              <h3 className="font-semibold">Tiempo de Producto</h3>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Tiempo desde creación:</span>
              <span>{Math.floor(Math.random() * 365) + 1} días</span>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={handleComparePrices}
              className="btn-futuristic flex items-center gap-2"
            >
              <DollarSign size={20} />
              Comparar precios
            </button>
          </div>
        </div>
      </Modal>
      <ComparePricesModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        gem={gem}
      />
    </>
  );
}

export default GemaDetailModal;
