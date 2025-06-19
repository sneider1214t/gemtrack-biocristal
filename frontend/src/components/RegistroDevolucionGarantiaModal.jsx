import React from "react";

function RegistroDevolucionGarantiaModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-card p-6 rounded-xl text-white shadow-xl fixed top-4 left-1/2 -translate-x-1/2">
        <h2 className="text-xl font-bold mb-4 text-accent">📦 Registro de devolución y garantía</h2>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          <div className="bg-slate-700 p-3 rounded">
            <p className="text-sm">🧾 Producto: <strong>Esmeralda</strong></p>
            <p className="text-sm">🕒 Fecha: 2025-05-12</p>
            <p className="text-sm">📦 Motivo: Daño en transporte</p>
          </div>
          <div className="bg-slate-700 p-3 rounded">
            <p className="text-sm">🧾 Producto: Rubí</p>
            <p className="text-sm">🕒 Fecha: 2025-05-11</p>
            <p className="text-sm">📦 Motivo: Garantía por defecto</p>
          </div>
          <div className="bg-slate-700 p-3 rounded">
            <p className="text-sm">🧾 Producto: Amatista</p>
            <p className="text-sm">🕒 Fecha: 2025-05-10</p>
            <p className="text-sm">📦 Motivo: Solicitud de cambio</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default RegistroDevolucionGarantiaModal;
