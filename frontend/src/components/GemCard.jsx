import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function GemCard({ gem, onViewDetail, rol }) {
  const [grams, setGrams] = useState(1);
  const { addToCart } = useCart();

  const increaseGrams = () => setGrams((prev) => prev + 1);
  const decreaseGrams = () => setGrams((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="product-card hover-glow">
      <div
        onClick={() => rol === "admin" && onViewDetail && onViewDetail(gem)}
        className={`overflow-hidden rounded-t-xl ${rol === "admin" ? "cursor-pointer" : "cursor-default"}`}
      >
        <img
          src={gem.imagen || "/img/zafiro.png"}
          alt={gem.name}
          className="w-full h-[200px] object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold neon-text mb-1">{gem.name}</h2>
        <p className="text-muted text-sm mb-2">{gem.descripcion}</p>
        <p className="text-muted mb-1">💵 Precio por gramo: ${gem.precio}</p>
        <p className="text-muted mb-3">📦 Stock disponible: {gem.stock}</p>

        <div className="mb-4">
          <label className="text-muted text-sm mr-2">Gramos:</label>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={decreaseGrams}
              className="btn-futuristic px-3 py-1"
            >
              ➖
            </button>
            <input
              type="number"
              value={grams}
              readOnly
              className="form-control w-16 text-center"
            />
            <button
              onClick={increaseGrams}
              className="btn-futuristic px-3 py-1"
            >
              ➕
            </button>
          </div>
        </div>

        <button
          onClick={() => addToCart(gem, grams)}
          className="btn-futuristic w-full"
        >
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}
