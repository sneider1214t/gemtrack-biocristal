import Modal from "./Modal";
import { DollarSign, CheckCircle, XCircle } from "lucide-react";

function ComparePricesModal({ isOpen, onClose, gem }) {
  const prices = [
    {
      name: "Precio Actual",
      price: gem.precio,
      icon: DollarSign,
      color: "text-cyan-500"
    },
    {
      name: "Precio Competencia 1",
      price: Math.floor(gem.precio * 0.9), // 10% menos
      icon: XCircle,
      color: "text-red-500"
    },
    {
      name: "Precio Competencia 2",
      price: Math.floor(gem.precio * 1.1), // 10% más
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      name: "Precio Competencia 3",
      price: Math.floor(gem.precio * 0.85), // 15% menos
      icon: XCircle,
      color: "text-red-500"
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📊 Comparación de Precios">
      <div className="space-y-4">
        {prices.map((price, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <price.icon size={20} className={price.color} />
              <span className="font-semibold">{price.name}</span>
            </div>
            <span className="text-2xl font-bold">${price.price}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default ComparePricesModal;
