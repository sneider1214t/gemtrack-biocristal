import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ShoppingCart } from "lucide-react";
import Fuse from "fuse.js";
import AgregarProducto from "./AgregarProducto";
import GemCard from "./GemCard";
import { useCart } from "../context/CartContext";

const initialGemstones = [
  { id: 1, name: "Rubí", stock: 12, descripcion: "Gema roja intensa.", precio: 100000, imagen: "/img/ruby.png", categoria: "normal" },
  { id: 2, name: "Esmeralda", stock: 8, descripcion: "Verde y elegante.", precio: 120000, imagen: "/img/esmeralda.png", categoria: "normal" },
  { id: 3, name: "Sapphire", stock: 23, descripcion: "Azul profundo.", precio: 90000, imagen: "/img/sapphire.png", categoria: "normal" },
  { id: 4, name: "Amatista", stock: 4, descripcion: "Púrpura espiritual.", precio: 75000, imagen: "/img/amatista.png", categoria: "normal" },
  { id: 5, name: "Diamante", stock: 30, descripcion: "Brillante y eterno.", precio: 150000, imagen: "/img/diamante.png", categoria: "exclusivo" },
  { id: 6, name: "Citrinos", stock: 72, descripcion: "Amarillo radiante.", precio: 120000, imagen: "/img/citrinos.png", categoria: "exclusivo" },
  { id: 7, name: "Kit Rubí + Zafiro", stock: 10, descripcion: "Combo especial.", precio: 200000, imagen: "/img/kit.png", categoria: "kit" },
];

function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [gemstones, setGemstones] = useState(initialGemstones);
  const [rol, setRol] = useState(null);
  const [selectedGem, setSelectedGem] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const [formData, setFormData] = useState({ nombre: "", correo: "", direccion: "", celular: "" });
  const [mensajeEnviado, setMensajeEnviado] = useState(false);
  const { cart, clearCart, removeFromCart } = useCart();

  const totalItems = cart.reduce((sum, item) => sum + item.grams, 0);

  useEffect(() => {
    const savedRol = localStorage.getItem("rol");
    setRol(savedRol);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedGem || showCart ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedGem, showCart]);

  const agregarProducto = (nuevoProducto) => {
    const nuevoId = gemstones.length + 1;
    setGemstones([...gemstones, { id: nuevoId, ...nuevoProducto }]);
  };

  const fuse = useMemo(() => new Fuse(gemstones, { keys: ["name"], threshold: 0.3 }), [gemstones]);
  const filteredGemstones = useMemo(() =>
    search ? fuse.search(search).map(res => res.item) : gemstones,
    [search, fuse]
  );

  const gemasFiltradas = useMemo(() => {
    if (filtro === "todos") return filteredGemstones;
    return filteredGemstones.filter(g => g.categoria === filtro);
  }, [filteredGemstones, filtro]);

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-accent">Inventario</h2>
          <p className="text-muted mt-1">Bienvenido al Inventario de BioCristal.</p>
        </div>

        <div className="flex items-center gap-4">
          {rol === "admin" && <AgregarProducto onAgregarProducto={agregarProducto} />}

          <div className="relative">
            {rol && (
              <div
                title="Cerrar sesión"
                onClick={() => {
                  localStorage.removeItem("rol");
                  localStorage.removeItem("auth");
                  navigate("/");
                }}
                className={`absolute -top-9 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md cursor-pointer ${
                  rol === "admin" ? "bg-blue-800" : "bg-gray-600"
                }`}
              >
                {rol === "admin" ? "ADM" : "TRB"}
              </div>
            )}
            <ShoppingCart
              size={32}
              className="text-white cursor-pointer"
              onClick={() => setShowCart(true)}
            />
            {totalItems > 0 && (
              <span className="absolute -top-3 -right-3 bg-black text-white text-sm font-bold px-2 py-0.5 rounded-full shadow-md animate-bounce">
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Buscador + Filtro */}
      <div className="flex flex-col md:flex-row gap-4 mt-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-muted" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar gemas..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-card text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {search && (
            <X className="absolute right-3 top-3 text-muted cursor-pointer" size={20} onClick={() => setSearch("")} />
          )}
        </div>

        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="bg-sky-600 text-white px-4 py-2 rounded-xl focus:outline-none"
        >
          <option value="todos">Todos</option>
          <option value="kit">Kits</option>
          <option value="exclusivo">Colección exclusiva</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-6 place-items-center">
        {gemasFiltradas.map((gem) => (
          <GemCard key={gem.id} gem={gem} rol={rol} onViewDetail={setSelectedGem} />
        ))}
      </div>
      

       {/* Modal Detalle + Comparación */}
      {selectedGem && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-card p-6 rounded-2xl w-[700px] shadow-xl text-white relative">
            <button
              onClick={() => {
                setSelectedGem(null);
                setShowComparison(false);
              }}
              className="absolute top-4 right-4 text-white text-xl hover:text-red-400"
            >
              ×
            </button>
            <div className="flex gap-6">
              <div className="w-1/2">
                <img src={selectedGem.imagen} alt={selectedGem.name} className="rounded-xl w-full object-cover" />
              </div>
              <div className="w-1/2">
                <h2 className="text-2xl font-bold text-white">{selectedGem.name}</h2>
                <p className="text-muted mt-1 mb-2">{selectedGem.descripcion}</p>
                <p>💵 Precio por gramo: ${selectedGem.precio}</p>
                <p>📦 Stock: {selectedGem.stock}</p>

                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold"
                >
                  {showComparison ? "Ocultar comparación" : "Comparar precio"}
                </button>

                {showComparison && (
                  <div className="mt-4 text-white text-sm space-y-1 animate-fade-in">
                    <p>💰 Sistema 1: ${selectedGem.precio + 1800}</p>
                    <p>💰 Sistema 2: ${selectedGem.precio + 3000}</p>
                    <p>💰 Sistema 3: ${selectedGem.precio + 1900}</p>
                    <p>💰 Sistema 4: ${selectedGem.precio + 2500}</p>
                    <p>💰 Sistema 5: ${selectedGem.precio + 2300}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Carrito */}
      {showCart && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-card p-6 rounded-2xl max-w-2xl w-full text-white relative shadow-xl overflow-y-auto max-h-[90vh]">
            <button className="absolute top-4 right-4 text-white text-xl hover:text-red-400" onClick={() => setShowCart(false)}>×</button>
            <h2 className="text-2xl font-bold mb-4 text-accent">🛒 Carrito</h2>

            {cart.length === 0 ? (
              <p className="text-muted">Tu carrito está vacío.</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-background p-3 rounded-xl shadow">
                    <div>
                      <h3 className="font-bold text-sky-400">{item.name}</h3>
                      <p className="text-sm text-muted">{item.grams}g x ${item.precio} = ${item.grams * item.precio}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={item.imagen} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 font-bold hover:underline"
                        title="Eliminar producto"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <p className="text-right font-semibold text-lg">
                  Total: <span className="text-accent">${cart.reduce((sum, i) => sum + i.precio * i.grams, 0).toLocaleString()}</span>
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    console.log("Datos del recibo:", formData, cart);
                    setMensajeEnviado(true);
                    setTimeout(() => setMensajeEnviado(false), 4000);
                  }}
                  className="mt-6 space-y-3"
                >
                  <input type="text" placeholder="Nombre completo" className="w-full p-2 rounded bg-slate-700 text-white" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                  <input type="email" placeholder="Correo electrónico" className="w-full p-2 rounded bg-slate-700 text-white" value={formData.correo} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} required />
                  <input type="text" placeholder="Dirección" className="w-full p-2 rounded bg-slate-700 text-white" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} required />
                  <input type="tel" placeholder="Número de celular" className="w-full p-2 rounded bg-slate-700 text-white" value={formData.celular} onChange={(e) => setFormData({ ...formData, celular: e.target.value })} required />

                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-bold">
                    Realizar compra
                  </button>

                  {mensajeEnviado && (
                    <p className="text-purple-400 font-semibold mt-2 text-center">
                      ✅ ¡Recibo enviado al correo!
                    </p>
                  )}
                </form>

                <button onClick={() => { clearCart(); setShowCart(false); }} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold">
                  Vaciar carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
