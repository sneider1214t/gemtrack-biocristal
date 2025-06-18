import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ObservacionesModal from "./ObservacionesModal";
import NotificacionesModal from "./NotificacionesModal";
import RegistroDevolucionGarantiaModal from "./RegistroDevolucionGarantiaModal";
import ImportExportModal from "./ImportExportModal";
import RegistroTablasModal from "./RegistroTablasModal";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openSections, setOpenSections] = useState({
    herramientas: false,
    informes: false,
    configuracion: false,
    almacen: false,
  });

  const [showImportExport, setShowImportExport] = useState(false);
  const [showObservaciones, setShowObservaciones] = useState(false);
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [showRegistroTablasModal, setShowRegistroTablasModal] = useState(false);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleRoute = (route) => {
    if (location.pathname === route) {
      navigate("/dashboard");
    } else {
      navigate(route);
    }
  };

  const Section = ({ title, items, id, icon }) => (
    <div className="mb-4">
      <button
        onClick={() => toggleSection(id)}
        className="flex items-center gap-2 w-full text-left font-semibold hover:text-accent"
      >
        {openSections[id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        {icon && <span>{icon}</span>}
        {title}
      </button>

      <AnimatePresence initial={false}>
        {openSections[id] && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="ml-6 mt-2 space-y-1 text-sm text-muted overflow-hidden"
          >
            {items.map((item, index) => (
              <li
                key={index}
                onClick={item?.action || undefined}
                className={`hover:text-accent cursor-pointer ${item?.action ? "font-medium" : ""}`}
              >
                {typeof item === "string" ? item : item.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="w-64 bg-card text-white shadow-lg p-4 rounded-r-2xl overflow-y-auto scrollbar-hide">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-accent flex items-center justify-center gap-2">
          BioCristal <span className="text-cyan-400">💎</span>
        </h1>
      </div>

      <Section
        title="Herramientas"
        id="herramientas"
        items={[
          { label: "Observaciones", action: () => setShowObservaciones(true) },
          { label: "Notificaciones", action: () => setShowNotificaciones(true) },
          { label: "Registro devolución", action: () => setShowRegistroModal(true) },
          { label: "Registro tablas", action: () => setShowRegistroTablasModal(true) },
          { label: "Importar / Exportar", action: () => setShowImportExport(true) },
        ]}
      />

      <Section
        title="Informes"
        id="informes"
        items={[
          { label: "Ingresos", action: () => handleToggleRoute("/ingresos") },
          { label: "Tipo moneda", action: () => handleToggleRoute("/tipo-moneda") },
          { label: "Historial de compras", action: () => handleToggleRoute("/historial-compras") },
          { label: "Actualizaciones", action: () => handleToggleRoute("/actualizaciones") },
        ]}
      />

      <Section
        title="Configuración"
        id="configuracion"
        items={[
          { label: "Usuario", action: () => handleToggleRoute("/usuarios") },
          { label: "Ubicación", action: () => handleToggleRoute("/ubicacion") },
          { label: "Alertas", action: () => handleToggleRoute("/alertas") },
          { label: "Contabilidad", action: () => handleToggleRoute("/contabilidad") },
          { label: "Copia de seguridad", action: () => handleToggleRoute("/copia-seguridad") },
          { label: "Tiempo de un producto", action: () => handleToggleRoute("/tiempo-producto") },
          { label: "Descargas", action: () => handleToggleRoute("/descargas") },
        ]}
      />

      <Section
        title="Almacén"
        id="almacen"
        icon="🏷"
        items={[
          { label: "Tipos", action: () => handleToggleRoute("/tipos") },
          { label: "Niveles stock", action: () => handleToggleRoute("/niveles-stock") },
          { label: "Generar documento", action: () => handleToggleRoute("/generar-documento") },
          { label: "Ubicaciones de almacenes", action: () => handleToggleRoute("/ubicaciones-almacenes") },
          { label: "Recordatorios", action: () => handleToggleRoute("/recordatorios") },
          { label: "Órdenes de compra", action: () => handleToggleRoute("/ordenes-compra") },
        ]}
      />

      {/* Modales */}
      {showImportExport && <ImportExportModal onClose={() => setShowImportExport(false)} />}
      {showObservaciones && <ObservacionesModal onClose={() => setShowObservaciones(false)} />}
      {showNotificaciones && <NotificacionesModal onClose={() => setShowNotificaciones(false)} />}
      {showRegistroModal && <RegistroDevolucionGarantiaModal onClose={() => setShowRegistroModal(false)} />}
      {showRegistroTablasModal && <RegistroTablasModal onClose={() => setShowRegistroTablasModal(false)} />}
    </div>
  );
}

export default Sidebar;
