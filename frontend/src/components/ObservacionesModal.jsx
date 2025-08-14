function ObservacionesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-card p-6 rounded-xl text-white shadow-xl fixed top-4 left-1/2 -translate-x-1/2">
        <h2 className="text-xl font-bold mb-4 text-accent">📝 Observaciones</h2>
        <textarea
          placeholder="Escribe tu observación..."
          className="w-full h-40 p-3 rounded bg-slate-700 text-white resize-none"
        ></textarea>
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

export default ObservacionesModal;
