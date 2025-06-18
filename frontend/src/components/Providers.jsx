import { useState } from "react";
import { Table } from "lucide-react";

function Providers() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Proveedores</h1>
      <div className="bg-card p-6 rounded-xl">
        <div className="flex items-center mb-6">
          <Table size={24} className="mr-2" />
          <h2 className="text-xl">Lista de Proveedores</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Contacto</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-600">
                <td className="px-4 py-2">Proveedor 1</td>
                <td className="px-4 py-2">Juan Pérez</td>
                <td className="px-4 py-2">proveedor1@email.com</td>
                <td className="px-4 py-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Editar</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-600">
                <td className="px-4 py-2">Proveedor 2</td>
                <td className="px-4 py-2">María López</td>
                <td className="px-4 py-2">proveedor2@email.com</td>
                <td className="px-4 py-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Editar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Providers;
