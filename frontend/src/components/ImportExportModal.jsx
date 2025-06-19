export default function ImportExportModal({ isOpen, onClose }) {
  return isOpen ? (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-card p-6 rounded-xl text-white shadow-xl fixed top-4 left-1/2 -translate-x-1/2">
        <h2 className="text-xl font-bold mb-4 text-accent">💾 Exportar / Importar Ventas</h2>

        {/* Exportar */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-sky-400 mb-3">Exportar datos</h3>
          <label className="block mb-1">Selecciona una fecha:</label>
          <input type="date" className="w-full bg-slate-700 text-white rounded p-2 mb-4" />
          <label className="block mb-1">Tipo de archivo:</label>
          <select className="w-full bg-slate-700 text-white rounded p-2">
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
          <button className="mt-4 bg-accent text-white px-4 py-2 rounded hover:bg-opacity-90">
            Exportar
          </button>
        </div>

        {/* Importar */}
        <div>
          <h3 className="text-lg font-semibold text-sky-400 mb-3">Importar datos</h3>
          <label className="block mb-1">Selecciona un archivo:</label>
          <input type="file" className="w-full bg-slate-700 text-white rounded p-2 mb-4" />
          <button className="mt-4 bg-accent text-white px-4 py-2 rounded hover:bg-opacity-90">
            Importar
          </button>
        </div>

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
  ) : null;
}
