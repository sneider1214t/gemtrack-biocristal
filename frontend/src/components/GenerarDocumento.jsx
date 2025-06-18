function GenerarDocumento() {
  return (
    <div className="flex-1 p-8 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6">Generar Documento</h2>
      <div className="bg-card p-6 rounded-xl shadow-xl">
        <p className="text-muted mb-4">Generación de documentos de almacén</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Generar PDF
        </button>
      </div>
    </div>
  );
}
export default GenerarDocumento;