import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Formulario from "./components/Formulario";
import Gemstones from "./components/Gemstones";
import Categories from "./components/Categories";
import Sales from "./components/Sales";
import Observaciones from "./components/Observaciones";
import Notificaciones from "./components/Notificaciones";
import RegistroDevolucion from "./components/RegistroDevolucion";
import RegistroTablas from "./components/RegistroTablas";
import DataManager from "./components/DataManager";
import Recuperar from "./components/Recuperar";
import Customers from "./components/Customers";



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
import Providers from "./components/Providers";
import HistorialVentas from "./components/HistorialVentas";
import Restablecer from "./components/Restablecer";




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
        {/* Redirección de la ruta base */}
        <Route path="/gemtrack-biocristal/*" element={<Navigate to="/inicio" replace />} />
        
        {/* Login sin layout */}
        <Route path="/" element={<Login />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/inicio" element={<ProtectedRoute>{withLayout(Dashboard)}</ProtectedRoute>} />
        <Route path="/reset-password/:token" element={<Restablecer />} />

        {/* Rutas protegidas con layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>{withLayout(Dashboard)}</ProtectedRoute>
        } />
        <Route path="/gemas" element={
          <ProtectedRoute>{withLayout(Gemstones)}</ProtectedRoute>
        } />
        <Route path="/categorias" element={
          <ProtectedRoute>{withLayout(Categories)}</ProtectedRoute>
        } />
        <Route path="/categorías" element={
          <ProtectedRoute>{withLayout(Categories)}</ProtectedRoute>
        } />
        <Route path="/administrar-usuarios" element={
          <ProtectedRoute>{withLayout(Usuarios)}</ProtectedRoute>
        } />
        <Route path="/proveedores" element={
          <ProtectedRoute>{withLayout(Providers)}</ProtectedRoute>
        } />
        <Route path="/clientes" element={
          <ProtectedRoute>{withLayout(Customers)}</ProtectedRoute>
        } />
        <Route path="/registro-devolucion" element={
          <ProtectedRoute>{withLayout(RegistroDevolucion)}</ProtectedRoute>
        } />
        <Route path="/registro-tablas" element={
          <ProtectedRoute>{withLayout(RegistroTablas)}</ProtectedRoute>
        } />
        <Route path="/nueva-venta" element={
          <ProtectedRoute>{withLayout(Sales)}</ProtectedRoute>
        } />
        <Route path="/historial-ventas" element={
          <ProtectedRoute>{withLayout(HistorialVentas)}</ProtectedRoute>
        } />
        <Route path="/historial-de-ventas" element={
          <ProtectedRoute>{withLayout(HistorialVentas)}</ProtectedRoute>
        } />
        <Route path="/usuarios" element={
          <ProtectedRoute>{withLayout(Usuarios)}</ProtectedRoute>
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
        <Route path="/observaciones" element={
          <ProtectedRoute>{withLayout(Observaciones)}</ProtectedRoute>
        } />
        <Route path="/notificaciones" element={
          <ProtectedRoute>{withLayout(Notificaciones)}</ProtectedRoute>
        } />
        <Route path="/registro-devolucion" element={
          <ProtectedRoute>{withLayout(RegistroDevolucion)}</ProtectedRoute>
        } />
        <Route path="/registro-tablas" element={
          <ProtectedRoute>{withLayout(RegistroTablas)}</ProtectedRoute>
        } />
        <Route path="/data-manager" element={
          <ProtectedRoute>{withLayout(DataManager)}</ProtectedRoute>
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
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </CartProvider>
  );
}

export default App;
