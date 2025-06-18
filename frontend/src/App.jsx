import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Formulario from "./components/Formulario";
import Gemstones from "./components/Gemstones";
import Categories from "./components/Categories";
import Sales from "./components/Sales";
import Customers from "./components/Customers";
import Ubicacion from "./components/Ubicacion";
import Ingresos from "./components/Ingresos";
import TipoMoneda from "./components/TipoMoneda";
import HistorialCompras from "./components/HistorialCompras";
import Actualizaciones from "./components/Actualizaciones";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import Usuarios from "./components/Usuarios";
import Alertas from "./components/Alertas";
import Contabilidad from "./components/Contabilidad";
import CopiaSeguridad from "./components/CopiaSeguridad";
import TiempoProducto from "./components/TiempoProducto";
import Descargas from "./components/Descargas";
import Tipos from "./components/Tipos";
import NivelesStock from "./components/NivelesStock";
import GenerarDocumento from "./components/GenerarDocumento";
import UbicacionesAlmacenes from "./components/UbicacionesAlmacenes";
import Recordatorios from "./components/Recordatorios";
import OrdenesCompra from "./components/OrdenesCompra";




function App() {
  const withLayout = (Component) => (
    <div className="flex bg-background min-h-screen text-text">
      <Sidebar />
      <Component />
    </div>
  );

  return (
    <CartProvider>
      <Routes>
        {/* Login sin layout */}
        <Route path="/" element={<Login />} />

        {/* Rutas protegidas con layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>{withLayout(Dashboard)}</ProtectedRoute>
        } />
        <Route path="/gemstones" element={
          <ProtectedRoute>{withLayout(Gemstones)}</ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute>{withLayout(Categories)}</ProtectedRoute>
        } />
        <Route path="/sales" element={
          <ProtectedRoute>{withLayout(Sales)}</ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute>{withLayout(Customers)}</ProtectedRoute>
        } />
        <Route path="/formulario" element={
          <ProtectedRoute>{withLayout(Formulario)}</ProtectedRoute>
        } />
        <Route path="/ubicacion" element={
          <ProtectedRoute>{withLayout(Ubicacion)}</ProtectedRoute>
        } />
        <Route path="/ingresos" element={
          <ProtectedRoute>{withLayout(Ingresos)}</ProtectedRoute>
        } />
        <Route path="/tipo-moneda" element={
          <ProtectedRoute>{withLayout(TipoMoneda)}</ProtectedRoute>
        } />
        <Route path="/historial-compras" element={
          <ProtectedRoute>{withLayout(HistorialCompras)}</ProtectedRoute>
        } />
        <Route path="/actualizaciones" element={
          <ProtectedRoute>{withLayout(Actualizaciones)}</ProtectedRoute>
        } />
        <Route path="/usuarios" element={ // ✅ nueva ruta agregada
          <ProtectedRoute>{withLayout(Usuarios)}</ProtectedRoute>
        } />
        <Route path="/alertas" element={
          <ProtectedRoute>{withLayout(Alertas)}</ProtectedRoute>
        } />
        <Route path="/contabilidad" element={
          <ProtectedRoute>{withLayout(Contabilidad)}</ProtectedRoute>
        } />
        <Route path="/copia-seguridad" element={
          <ProtectedRoute>{withLayout(CopiaSeguridad)}</ProtectedRoute>
        } />
        <Route path="/tiempo-producto" element={
          <ProtectedRoute>{withLayout(TiempoProducto)}</ProtectedRoute>
        } />
        <Route path="/descargas" element={
          <ProtectedRoute>{withLayout(Descargas)}</ProtectedRoute>
        } />
        <Route path="/tipos" element={
          <ProtectedRoute>{withLayout(Tipos)}</ProtectedRoute>
        } />
        <Route path="/niveles-stock" element={
          <ProtectedRoute>{withLayout(NivelesStock)}</ProtectedRoute>
        } />
        <Route path="/generar-documento" element={
          <ProtectedRoute>{withLayout(GenerarDocumento)}</ProtectedRoute>
        } />
        <Route path="/ubicaciones-almacenes" element={
          <ProtectedRoute>{withLayout(UbicacionesAlmacenes)}</ProtectedRoute>
        } />
        <Route path="/recordatorios" element={
          <ProtectedRoute>{withLayout(Recordatorios)}</ProtectedRoute>
        } />
        <Route path="/ordenes-compra" element={
          <ProtectedRoute>{withLayout(OrdenesCompra)}</ProtectedRoute>
        } />
      </Routes>
    </CartProvider>
  );
}

export default App;
