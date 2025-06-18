import { useState } from "react";
import { Calendar, DollarSign } from "lucide-react";

function HistorialVentas() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Historial de Ventas</h1>
      <div className="bg-card p-6 rounded-xl">
        <div className="flex items-center mb-6">
          <Calendar size={24} className="mr-2" />
          <h2 className="text-xl">Ventas Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-600">
                <td className="px-4 py-2">2025-06-18</td>
                <td className="px-4 py-2">Cliente 1</td>
                <td className="px-4 py-2">
                  <DollarSign className="inline-block mr-1" />
                  1,250.00
                </td>
                <td className="px-4 py-2">Completada</td>
                <td className="px-4 py-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Ver Detalles</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-600">
                <td className="px-4 py-2">2025-06-17</td>
                <td className="px-4 py-2">Cliente 2</td>
                <td className="px-4 py-2">
                  <DollarSign className="inline-block mr-1" />
                  850.00
                </td>
                <td className="px-4 py-2">Pendiente</td>
                <td className="px-4 py-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Ver Detalles</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HistorialVentas;
