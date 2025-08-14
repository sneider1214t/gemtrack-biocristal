import { createContext, useContext, useState } from "react";

// Crear el contexto del carrito
const CartContext = createContext();

// Proveedor del carrito
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Añadir producto al carrito (o aumentar cantidad si ya existe)
  const addToCart = (gem, grams) => {
    const itemExistente = cart.find(item => item.id === gem.id);
    if (itemExistente) {
      setCart(cart.map(item =>
        item.id === gem.id
          ? { ...item, grams: item.grams + grams }
          : item
      ));
    } else {
      setCart([...cart, { ...gem, grams }]);
    }
  };

  // Eliminar un producto del carrito
  const removeFromCart = (gemId) => {
    setCart(cart.filter(item => item.id !== gemId));
  };

  // Vaciar todo el carrito
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook para usar el contexto del carrito
export function useCart() {
  return useContext(CartContext);
}
