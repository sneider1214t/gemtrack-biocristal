import { ArrowLeftCircle } from "lucide-react";

function RegistroDevolucion() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ArrowLeftCircle size={24} className="text-red-500" />
        <h1 className="text-2xl font-bold">🔄 Registro Devolución</h1>
      </div>
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-300">
          Gestiona y registra devoluciones de productos.
        </p>
      </div>
    </div>
  );
}

export default RegistroDevolucion;
