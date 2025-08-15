import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const toImgUrl = (gem) =>
    gem.imagen ||
    (gem.imagen_producto
      ? `http://localhost:3000/api/productos/images/${gem.imagen_producto}`
      : "/gemtrack-biocristal/img/zafiro.png");

  const makeEntryFromGem = (gem) => ({
    id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
    productId: gem.codigo_producto || gem.id,
    name: gem.nombre_producto || gem.name,
    imagen: toImgUrl(gem),
    precio: Number(gem.precio_venta ?? gem.precio ?? 0),
    unidad: gem.unidad_medida || gem.unidad || "",
    grams: 1, // cada entrada representa 1 unidad/gramo
  });

  // Agrega N entradas para que en el carrito se vean como 3 + 2 = 5 ítems
  const addToCart = (gem, grams = 1) => {
    const n = Math.max(1, Number(grams) || 1);
    const entries = Array.from({ length: n }, () => makeEntryFromGem(gem));
    setCart((prev) => [...prev, ...entries]);
  };

  const removeFromCart = (entryId) =>
    setCart((prev) => prev.filter((i) => i.id !== entryId));

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
