import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HerramientasModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('observaciones');

  const tabs = [
    { id: 'observaciones', label: 'Observaciones' },
    { id: 'notificaciones', label: 'Notificaciones' },
    { id: 'devolucion', label: 'Registro devolución' },
    { id: 'tablas', label: 'Registro tablas' },
    { id: 'importexport', label: 'Importar / Exportar' }
  ];

  const content = {
    observaciones: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Observaciones</h2>
        <p className="text-sm text-muted">Gestiona las observaciones del sistema</p>
      </div>
    ),
    notificaciones: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Notificaciones</h2>
        <p className="text-sm text-muted">Configura y gestiona las notificaciones del sistema</p>
      </div>
    ),
    devolucion: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Registro de Devolución</h2>
        <p className="text-sm text-muted">Registra devoluciones de garantía</p>
      </div>
    ),
    tablas: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Registro de Tablas</h2>
        <p className="text-sm text-muted">Gestiona las tablas del sistema</p>
      </div>
    ),
    importexport: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Importar / Exportar</h2>
        <p className="text-sm text-muted">Importa y exporta datos del sistema</p>
      </div>
    )
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-black rounded-lg p-6 max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-500"
          >
            ×
          </button>

          <div className="mb-6">
            <div className="flex space-x-4 border-b border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-b-2 border-red-500 text-red-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {content[activeTab]}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HerramientasModal;
