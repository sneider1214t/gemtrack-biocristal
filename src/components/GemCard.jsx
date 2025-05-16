import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function GemCard({ gem, onViewDetail, rol }) {
  const [grams, setGrams] = useState(1);
  const { addToCart } = useCart();

  const increaseGrams = () => setGrams((prev) => prev + 1);
  const decreaseGrams = () => setGrams((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="bg-[#1e293b] rounded-xl shadow-lg overflow-hidden w-full max-w-[300px] transition-transform hover:scale-[1.02]">
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
      <div className="p-4 text-white">
        <h2 className="text-xl font-bold text-sky-400 mb-1">{gem.name}</h2>
        <p className="text-slate-300 text-sm mb-2">{gem.descripcion}</p>
        <p className="text-slate-200 mb-1">💵 Precio por gramo: ${gem.precio}</p>
        <p className="text-slate-200 mb-3">📦 Stock disponible: {gem.stock}</p>

        <div className="mb-4">
          <label className="text-slate-200 text-sm mr-2">Gramos:</label>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={decreaseGrams}
              className="bg-sky-500 text-white px-3 py-1 rounded hover:bg-sky-600"
            >
              ➖
            </button>
            <input
              type="number"
              value={grams}
              readOnly
              className="w-16 p-1 text-center rounded bg-slate-700 text-white border-none"
            />
            <button
              onClick={increaseGrams}
              className="bg-sky-500 text-white px-3 py-1 rounded hover:bg-sky-600"
            >
              ➕
            </button>
          </div>
        </div>

        <button
          onClick={() => addToCart(gem, grams)}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}
