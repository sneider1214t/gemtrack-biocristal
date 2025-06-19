import { Database } from "lucide-react";

function RegistroTablas() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Database size={24} className="text-purple-500" />
        <h1 className="text-2xl font-bold">📊 Registro Tablas</h1>
      </div>
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-300">
          Gestiona y configura las tablas del sistema.
        </p>
      </div>
    </div>
  );
}

export default RegistroTablas;
