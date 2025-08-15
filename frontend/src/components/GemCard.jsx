import { useState } from "react";
import { useCart } from "../context/CartContext";
import GemaDetailModal from "./GemaDetailModal";

// Resuelve la URL pública de la imagen guardada por multer
const imgUrl = (g) =>
  g?.imagen_producto
    ? `http://localhost:3000/api/productos/images/${g.imagen_producto}`
    : g?.imagen || "/gemtrack-biocristal/img/zafiro.png";

export default function GemCard({ gem, rol }) {
  // gem de Productos: { codigo_producto, nombre_producto, unidad_medida, precio_venta, stock, imagen_producto, ... }
  const [qty, setQty] = useState(1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { addToCart } = useCart();

  const increase = () => setQty((n) => n + 1);
  const decrease = () => setQty((n) => (n > 1 ? n - 1 : 1));

  const nombre = gem?.nombre_producto || gem?.name || "Producto";
  const codigo = gem?.codigo_producto || gem?.codigo || "-";
  const unidad = gem?.unidad_medida || gem?.unidad || "-";
  const stock = gem?.stock ?? 0;
  const precioVenta = Number(gem?.precio_venta ?? gem?.precio ?? 0);

  // Modal mantiene compatibilidad
  const gemForModal = {
    imagen: imgUrl(gem),
    name: nombre,
    descripcion: `Código: ${codigo} — Unidad: ${unidad}`,
    precio: precioVenta,
    stock,
  };

  // Para el carrito, garantizamos que exista "precio"
  const onAdd = () => {
    const item = { ...gem, precio: precioVenta };
    addToCart(item, qty);
  };

  return (
    <>
      <div className="product-card hover-glow">
        <div
          onClick={() => setIsDetailOpen(true)}
          className="overflow-hidden rounded-t-xl cursor-pointer"
        >
          <img
            src={imgUrl(gem)}
            alt={nombre}
            className="w-full h-[200px] object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="p-4">
          <h2 className="text-xl font-bold neon-text mb-1">{nombre}</h2>

          {/* Datos pedidos */}
          <p className="text-muted text-sm mb-1">🧾 Código: {codigo}</p>
          <p className="text-muted text-sm mb-1">📏 Unidad: {unidad}</p>
          <p className="text-muted text-sm mb-1">
            💵 Precio de venta: ${precioVenta.toLocaleString()}
          </p>
          <p className="text-muted mb-3">📦 Stock disponible: {stock}</p>

          {/* Cantidad */}
          <div className="mb-4">
            <label className="text-muted text-sm mr-2">Cantidad:</label>
            <div className="flex items-center gap-2 mt-2">
              <button onClick={decrease} className="btn-futuristic px-3 py-1">
                ➖
              </button>
              <input
                type="number"
                value={qty}
                readOnly
                className="form-control w-16 text-center"
              />
              <button onClick={increase} className="btn-futuristic px-3 py-1">
                ➕
              </button>
            </div>
          </div>

          <button onClick={onAdd} className="btn-futuristic w-full">
            Añadir al carrito
          </button>
        </div>
      </div>

      <GemaDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        gem={gemForModal}
      />
    </>
  );
}
