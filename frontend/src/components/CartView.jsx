import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import CheckoutForm from "./CheckoutForm";

export default function CartView() {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (item.precio || 0) * (item.grams || 1), 0),
    [cart]
  );

  return (
    <div className="glass-card p-6">
      <h2 className="text-3xl neon-text mb-6">💎 Carrito de compras</h2>

      {cart.length === 0 ? (
        <div className="text-center text-muted">
          <p className="mb-4">Tu carrito está vacío.</p>
          <button className="btn-futuristic">Comenzar a comprar</button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="glass-card hover-glow p-4 flex items-center gap-4"
              >
                <img
                  src={item.imagen}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl neon-text">{item.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-muted">
                      Cantidad: {item.grams} x ${item.precio} = $
                      {(item.precio || 0) * (item.grams || 1)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="btn-futuristic text-red-500 hover:text-red-400"
                      title="Eliminar este ítem"
                    >
                      <Trash2 size={18} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 flex justify-between items-center">
              <span className="text-xl neon-text">Total:</span>
              <span className="text-2xl neon-text">
                ${total.toLocaleString()}
              </span>
            </div>

            <button
              onClick={clearCart}
              className="btn-futuristic w-full mt-2 text-red-400 hover:text-red-300"
            >
              Vaciar carrito
            </button>
            {/* Formulario de venta (Factura + Transacción) */}
          <div className="mt-8 glass-card p-5">
            <h3 className="text-2xl neon-text mb-4">🧾 Finalizar compra</h3>
            <CheckoutForm onClose={() => {}} />
          </div>
          </div>

          
        </>
      )}
    </div>
  );
}

