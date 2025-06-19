import { ArrowUpDown } from "lucide-react";

function ImportExport() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ArrowUpDown size={24} className="text-cyan-500" />
        <h1 className="text-2xl font-bold">🔄 Importar/Exportar</h1>
      </div>
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-300">
          Importa y exporta datos del sistema.
        </p>
      </div>
    </div>
  );
}

export default ImportExport;
