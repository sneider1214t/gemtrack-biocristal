import { 
  Home, 
  List, 
  ShoppingCart, 
  Wrench, 
  Users, 
  Gem, 
  Tag, 
  Truck, 
  PlusCircle, 
  History, 
  MessageSquare, 
  Bell, 
  ArrowLeftCircle, 
  Table, 
  UploadCloud, 
  UserCog,
  DollarSign,
  Save,
  Clock,
  Download,
  BarChart,
  FileText,
  MapPin,
  ShoppingBag
} from 'lucide-react';

import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Modal from "./Modal";
import ObservacionesModal from "./ObservacionesModal";
import NotificacionesModal from "./NotificacionesModal";
import RegistroDevolucionGarantiaModal from "./RegistroDevolucionGarantiaModal";
import ImportExportModal from "./ImportExportModal";
import RegistroTablasModal from "./RegistroTablasModal";
import AlertasModal from "./AlertasModal";
import ContabilidadModal from "./ContabilidadModal";
import CopiaSeguridadModal from "./CopiaSeguridadModal";
import TiempoProductoModal from "./TiempoProductoModal";
import DescargasModal from "./DescargasModal";
import TiposModal from "./TiposModal";
import NivelesStockModal from "./NivelesStockModal";
import GenerarDocumentoModal from "./GenerarDocumentoModal";
import UbicacionesAlmacenesModal from "./UbicacionesAlmacenesModal";
import RecordatoriosModal from "./RecordatoriosModal";
import OrdenesCompraModal from "./OrdenesCompraModal";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados para secciones del menú
  const [openSections, setOpenSections] = useState({
    dashboard: false,
    catalogo: false,
    ventas: false,
    herramientas: false,
    usuarios: false
  });

  // Estados para modales
  const [modalStates, setModalStates] = useState({
    importExport: false,
    observaciones: false,
    notificaciones: false,
    registroDevolucion: false,
    alertas: false,
    contabilidad: false,
    copiaSeguridad: false,
    tiempoProducto: false,
    descargas: false,
    tipos: false,
    nivelesStock: false,
    generarDocumento: false,
    ubicacionesAlmacenes: false,
    recordatorios: false,
    ordenesCompra: false,
    registroTablas: false
  });

  // Manejo de navegación y cierre de modales
  const handleToggleRoute = (path) => {
    // Cerrar todos los modales antes de navegar
    setModalStates({
      importExport: false,
      observaciones: false,
      notificaciones: false,
      registroDevolucion: false,
      alertas: false,
      contabilidad: false,
      copiaSeguridad: false,
      tiempoProducto: false,
      descargas: false,
      tipos: false,
      nivelesStock: false,
      generarDocumento: false,
      ubicacionesAlmacenes: false,
      recordatorios: false,
      ordenesCompra: false,
      registroTablas: false
    });
    navigate(path);
  };

  // Manejo centralizado de modales
  const handleModalOpen = (modal) => {
    setModalStates(prev => ({
      ...prev,
      [modal]: true
    }));
  };

  // Asegurar que el estado de registroTablas esté inicializado como false
  useEffect(() => {
    setModalStates(prev => ({
      ...prev,
      registroTablas: false
    }));
  }, []);

  const handleCloseModal = (modal) => {
    setModalStates(prev => ({
      ...prev,
      [modal]: false
    }));
  };

  // Funciones de manejo de modales
  const handleObservaciones = () => handleModalOpen('observaciones');
  const handleNotificaciones = () => handleModalOpen('notificaciones');
  const handleRegistroDevolucion = () => handleModalOpen('registroDevolucion');
  const handleRegistroTablas = () => handleModalOpen('registroTablas');
  const handleAlertas = () => handleModalOpen('alertas');
  const handleContabilidad = () => handleModalOpen('contabilidad');
  const handleCopiaSeguridad = () => handleModalOpen('copiaSeguridad');
  const handleTiempoProducto = () => handleModalOpen('tiempoProducto');
  const handleDescargas = () => handleModalOpen('descargas');
  const handleTipos = () => handleModalOpen('tipos');
  const handleNivelesStock = () => handleModalOpen('nivelesStock');
  const handleGenerarDocumento = () => handleModalOpen('generarDocumento');
  const handleUbicacionesAlmacenes = () => handleModalOpen('ubicacionesAlmacenes');
  const handleRecordatorios = () => handleModalOpen('recordatorios');
  const handleOrdenesCompra = () => handleModalOpen('ordenesCompra');

  // Efecto para cerrar todos los modales al cambiar de ruta
  useEffect(() => {
    setModalStates({
      importExport: false,
      observaciones: false,
      notificaciones: false,
      registroDevolucion: false,
      alertas: false,
      contabilidad: false,
      copiaSeguridad: false,
      tiempoProducto: false,
      descargas: false,
      tipos: false,
      nivelesStock: false,
      generarDocumento: false,
      ubicacionesAlmacenes: false,
      recordatorios: false,
      ordenesCompra: false,
      registroTablas: false
    });
  }, [location.pathname]);

  // Función para alternar secciones
  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };



  const Section = ({ title, items, id, icon: Icon, handleModalOpen, handleCloseModal }) => (
    <div className="mb-4">
      <button
        onClick={() => toggleSection(id)}
        className="flex items-center gap-2 w-full text-left neon-text hover-glow"
      >
        {openSections[id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        {Icon && <Icon size={18} />}
        {title}
      </button>

      {openSections[id] && (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                switch (item.label) {
                  case "Observaciones":
                    handleModalOpen('observaciones');
                    break;
                  case "Notificaciones":
                    handleModalOpen('notificaciones');
                    break;
                  case "Registro devolución":
                    handleModalOpen('registroDevolucion');
                    break;
                  case "Registro tablas":
                    handleModalOpen('registroTablas');
                    break;
                  case "Importar / Exportar":
                    handleModalOpen('importExport');
                    break;
                  case "Alertas":
                    handleModalOpen('alertas');
                    break;
                  case "Contabilidad":
                    handleModalOpen('contabilidad');
                    break;
                  case "Copia de seguridad":
                    handleModalOpen('copiaSeguridad');
                    break;
                  case "Tiempo de producto":
                    handleModalOpen('tiempoProducto');
                    break;
                  case "Descargas":
                    handleModalOpen('descargas');
                    break;
                  case "Tipos":
                    handleModalOpen('tipos');
                    break;
                  case "Niveles de stock":
                    handleModalOpen('nivelesStock');
                    break;
                  case "Generar documento":
                    handleModalOpen('generarDocumento');
                    break;
                  case "Ubicaciones almacenes":
                    handleModalOpen('ubicacionesAlmacenes');
                    break;
                  case "Recordatorios":
                    handleModalOpen('recordatorios');
                    break;
                  case "Órdenes de compra":
                    handleModalOpen('ordenesCompra');
                    break;
                  default:
                    handleToggleRoute(`/${item.path || item.label.toLowerCase().replace(/\s+/g, '-')}`);
                }
              }}
              className="w-full bg-black text-white rounded-md p-4 hover:bg-white hover:text-black transition-all flex flex-col items-center justify-center text-sm"
            >
              {item.icon && <item.icon size={20} className="mb-2" />}
              <span className="text-center">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const sections = [
    {
      id: "inicio",
      title: "Inicio",
      icon: Home,
      items: [
        {
          label: "Inicio",
          icon: Home
        }
      ]
    },
    {
      id: "gemas",
      title: "Gemas",
      icon: Gem,
      items: [
        {
          label: "Gemas",
          icon: Gem
        },
        {
          label: "Categorías",
          icon: Tag
        },
        {
          label: "Proveedores",
          icon: Truck
        }
      ]
    },
    {
      id: "ventas",
      title: "Ventas",
      icon: ShoppingCart,
      items: [
        {
          label: "Nueva venta",
          icon: PlusCircle
        },
        {
          label: "Historial de ventas",
          icon: History
        }
      ]
    },
    {
      id: "herramientas",
      title: "Herramientas",
      icon: Wrench,
      items: [
        {
          label: "Observaciones",
          icon: MessageSquare
        },
        {
          label: "Notificaciones",
          icon: Bell
        },
        {
          label: "Registro devolución",
          icon: ArrowLeftCircle
        },
        {
          label: "Registro tablas",
          icon: Table
        },
        {
          label: "Importar / Exportar",
          icon: UploadCloud
        },
        {
          label: "Alertas",
          icon: Bell
        },
        {
          label: "Contabilidad",
          icon: DollarSign
        },
        {
          label: "Copia de seguridad",
          icon: Save
        },
        {
          label: "Tiempo de producto",
          icon: Clock
        },
        {
          label: "Descargas",
          icon: Download
        },
        {
          label: "Tipos",
          icon: Tag
        },
        {
          label: "Niveles de stock",
          icon: BarChart
        },
        {
          label: "Generar documento",
          icon: FileText
        },
        {
          label: "Ubicaciones almacenes",
          icon: MapPin
        },
        {
          label: "Recordatorios",
          icon: Clock
        },
        {
          label: "Órdenes de compra",
          icon: ShoppingBag
        }
      ]
    },
    {
      id: "usuarios",
      title: "Usuarios",
      icon: Users,
      items: [
        {
          label: "Administrar usuarios",
          icon: UserCog
        }
      ]
    }
  ];

  return (
    <div className="glass-card w-64 p-4 rounded-r-2xl overflow-y-auto scrollbar-hide">
      <div className="mb-6 text-center">
        <h1 className="text-3xl neon-text flex items-center justify-center gap-2">
          <span className="text-4xl">💎</span> BioCristal
        </h1>
      </div>

      {sections.map((section) => (
        <Section
          key={section.id}
          title={section.title}
          id={section.id}
          icon={section.icon}
          items={section.items}
          handleModalOpen={handleModalOpen}
          handleCloseModal={handleCloseModal}
        />
      ))}

      <ObservacionesModal
        isOpen={modalStates.observaciones}
        onClose={() => handleCloseModal('observaciones')}
      />

      <ImportExportModal
        isOpen={modalStates.importExport}
        onClose={() => handleCloseModal('importExport')}
      />

      <RegistroDevolucionGarantiaModal
        isOpen={modalStates.registroDevolucion}
        onClose={() => handleCloseModal('registroDevolucion')}
      />

      <RegistroTablasModal
        isOpen={modalStates.registroTablas}
        onClose={() => handleCloseModal('registroTablas')}
      />

      <AlertasModal
        isOpen={modalStates.alertas}
        onClose={() => handleCloseModal('alertas')}
      />

      <ContabilidadModal
        isOpen={modalStates.contabilidad}
        onClose={() => handleCloseModal('contabilidad')}
      />

      <CopiaSeguridadModal
        isOpen={modalStates.copiaSeguridad}
        onClose={() => handleCloseModal('copiaSeguridad')}
      />

      <TiempoProductoModal
        isOpen={modalStates.tiempoProducto}
        onClose={() => handleCloseModal('tiempoProducto')}
      />

      <DescargasModal
        isOpen={modalStates.descargas}
        onClose={() => handleCloseModal('descargas')}
      />

      <TiposModal
        isOpen={modalStates.tipos}
        onClose={() => handleCloseModal('tipos')}
      />

      <NivelesStockModal
        isOpen={modalStates.nivelesStock}
        onClose={() => handleCloseModal('nivelesStock')}
      />

      <GenerarDocumentoModal
        isOpen={modalStates.generarDocumento}
        onClose={() => handleCloseModal('generarDocumento')}
      />

      <UbicacionesAlmacenesModal
        isOpen={modalStates.ubicacionesAlmacenes}
        onClose={() => handleCloseModal('ubicacionesAlmacenes')}
      />

      <RecordatoriosModal
        isOpen={modalStates.recordatorios}
        onClose={() => handleCloseModal('recordatorios')}
      />

      <OrdenesCompraModal
        isOpen={modalStates.ordenesCompra}
        onClose={() => handleCloseModal('ordenesCompra')}
      />
    </div>
  );
}

export default Sidebar;
