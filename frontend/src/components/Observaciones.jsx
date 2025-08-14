import { MessageSquare } from "lucide-react";

function Observaciones() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={24} className="text-blue-500" />
        <h1 className="text-2xl font-bold">📝 Observaciones</h1>
      </div>
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-300">
          Gestiona y visualiza las observaciones registradas en el sistema.
        </p>
      </div>
    </div>
  );
}

export default Observaciones;
