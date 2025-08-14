import React from "react";

function NotificacionesModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-card p-6 rounded-xl text-white shadow-xl fixed top-4 left-1/2 -translate-x-1/2">
        <h2 className="text-xl font-bold mb-4 text-accent">🔔 Notificaciones</h2>
        <ul className="space-y-2 text-sm">
          <li className="bg-slate-700 p-3 rounded">📦 Pedido #1243 ha sido enviado</li>
          <li className="bg-slate-700 p-3 rounded">🧾 Nueva factura disponible</li>
          <li className="bg-slate-700 p-3 rounded">📢 Mantenimiento programado para mañana</li>
        </ul>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificacionesModal;
