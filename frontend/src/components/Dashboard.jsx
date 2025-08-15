// src/components/Dashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ShoppingCart, LogOut, ChevronDown, CheckCircle2 } from "lucide-react";
import Fuse from "fuse.js";
import axios from "axios";
import AgregarProducto from "./AgregarProducto";
import GemCard from "./GemCard";
import { useCart } from "../context/CartContext";
import CheckoutForm from "./CheckoutForm";

function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [gemstones, setGemstones] = useState([]);
  const [rol, setRol] = useState(null);
  const [selectedGem, setSelectedGem] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { cart, clearCart, removeFromCart } = useCart();

  // ✅ NUEVO: estado para mostrar el alert de “compra exitosa”
  const [saleOk, setSaleOk] = useState(false);
  useEffect(() => {
    if (!saleOk) return;
    const t = setTimeout(() => setSaleOk(false), 4000);
    return () => clearTimeout(t);
  }, [saleOk]);

  const productosApi = axios.create({
    baseURL: "http://localhost:3000/api/productos",
    headers: { "Content-Type": "application/json" },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const interceptor = productosApi.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => productosApi.interceptors.request.eject(interceptor);
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const { data } = await productosApi.get("/");
        setGemstones(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al obtener productos:", err);
        setGemstones([]);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const savedRol = localStorage.getItem("rol");
    setRol(savedRol);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedGem || showCart ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedGem, showCart]);

  const agregarProducto = (nuevo) => {
    setGemstones((prev) => [...prev, nuevo]);
  };

  const fuse = useMemo(
    () =>
      new Fuse(gemstones, {
        keys: ["nombre_producto", "codigo_producto"],
        threshold: 0.3,
      }),
    [gemstones]
  );

  const filteredGemstones = useMemo(
    () => (search ? fuse.search(search).map((r) => r.item) : gemstones),
    [search, fuse]
  );

  const totalItems = cart.reduce((sum, item) => sum + item.grams, 0);

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-accent">Inventario</h2>
          <p className="text-muted mt-1">Bienvenido al Inventario de BioCristal.</p>
        </div>

        <div className="flex items-center gap-4">
          {rol === "Administrador" && (
            <AgregarProducto onAgregarProducto={agregarProducto} />
          )}

          <div className="flex items-center gap-4">
            {/* Menú perfil */}
            <div className="relative profile-dropdown">
              {rol && (
                <div className="flex flex-col items-center">
                  <div
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md cursor-pointer transition-all duration-200 ${
                      rol === "Administrador"
                        ? "bg-blue-800 hover:bg-blue-900"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {rol === "Administrador" ? "ADM" : "EMP"}
                    <ChevronDown
                      size={14}
                      className={`ml-0.5 transition-transform duration-200 ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isProfileOpen && (
                    <div className="absolute right-0 top-10 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 overflow-hidden">
                      <div className="p-2 border-b border-gray-700">
                        <p className="text-sm text-white font-medium">Usuario: </p>
                        <p className="text-xs text-gray-400">
                          {rol === "Administrador" ? "Administrador" : "Empleado"}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.removeItem("rol");
                          localStorage.removeItem("auth");
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                      >
                        <LogOut size={14} />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Carrito */}
            <div className="relative">
              <ShoppingCart
                size={32}
                className="text-white cursor-pointer hover:text-blue-400 transition-colors"
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
      </div>

      {/* ✅ NUEVO: Alert de compra exitosa */}
      {saleOk && (
        <div className="mb-4 flex items-start gap-3 border border-green-500/60 bg-green-500/15 text-green-300 rounded-xl p-3">
          <CheckCircle2 size={18} className="mt-0.5" />
          <div className="flex-1 text-sm">¡Venta registrada correctamente!</div>
          <button
            type="button"
            onClick={() => setSaleOk(false)}
            className="opacity-70 hover:opacity-100"
            title="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Buscador */}
      <div className="flex flex-col md:flex-row gap-4 mt-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-muted" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-card text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {search && (
            <X
              className="absolute right-3 top-3 text-muted cursor-pointer"
              size={20}
              onClick={() => setSearch("")}
            />
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-6 place-items-center">
        {filteredGemstones.map((prod) => (
          <GemCard
            key={prod.codigo_producto}
            gem={prod}
            rol={rol}
          />
        ))}
      </div>

      {/* Modal Carrito */}
      {showCart && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-card p-6 rounded-2xl max-w-2xl w-full text-white relative shadow-xl overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-white text-xl hover:text-red-400"
              onClick={() => setShowCart(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-accent">🛒 Carrito</h2>

            {cart.length === 0 ? (
              <p className="text-muted">Tu carrito está vacío.</p>
            ) : (
              <>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-background p-3 rounded-xl shadow"
                    >
                      <div>
                        <h3 className="font-bold text-sky-400">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted">
                          {item.grams} x ${item.precio} = $
                          {(item.grams * item.precio).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src={item.imagen}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
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
                </div>

                <p className="text-right font-semibold text-lg mt-4">
                  Total:{" "}
                  <span className="text-accent">
                    $
                    {cart
                      .reduce((sum, i) => sum + i.precio * i.grams, 0)
                      .toLocaleString()}
                  </span>
                </p>

                <button
                  onClick={() => {
                    clearCart();
                    setShowCart(false);
                  }}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold"
                >
                  Vaciar carrito
                </button>

                {/* Formulario de venta */}
                <div className="mt-6 border-t border-gray-700 pt-5">
                  <h3 className="text-xl font-semibold mb-3 text-accent">🧾 Finalizar compra</h3>
                  {/* 👇 le pasamos onSuccess para mostrar el alert en el Dashboard */}
                  <CheckoutForm
                    onClose={() => setShowCart(false)}
                    onSuccess={() => setSaleOk(true)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
