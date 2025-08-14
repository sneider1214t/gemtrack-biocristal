import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";

function CartView() {
  const { cart, clearCart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.precio * item.grams,
    0
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
                    Gramos: {item.grams} x ${item.precio} = ${item.precio * item.grams}
                  </p>
                  <button
                    onClick={() => clearCart()}
                    className="btn-futuristic text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={18} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl neon-text">Total:</span>
              <span className="text-2xl neon-text">${total.toLocaleString()}</span>
            </div>
            <button className="btn-futuristic w-full">
              Proceder al pago
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartView;
