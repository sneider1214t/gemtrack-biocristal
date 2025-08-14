import { useState, useEffect } from "react";
import { Database, ChevronDown, Edit, Trash2, Plus, Save, X, Download } from "lucide-react";

// Datos de ejemplo para las tablas
const tableData = {
  tiposGema: [
    { id: 1, nombre: 'Zafiro', descripcion: 'Piedra preciosa azul', estado: 'Activo' },
    { id: 2, nombre: 'Rubí', descripcion: 'Piedra preciosa roja', estado: 'Activo' },
    { id: 3, nombre: 'Esmeralda', descripcion: 'Piedra preciosa verde', estado: 'Inactivo' },
  ],
  estadosPedido: [
    { id: 1, nombre: 'Pendiente', descripcion: 'Pedido en espera', estado: 'Activo' },
    { id: 2, nombre: 'En proceso', descripcion: 'Pedido en preparación', estado: 'Activo' },
    { id: 3, nombre: 'Completado', descripcion: 'Pedido finalizado', estado: 'Activo' },
  ],
  categorias: [
    { id: 1, nombre: 'Piedras preciosas', descripcion: 'Categoría para gemas valiosas', estado: 'Activo' },
    { id: 2, nombre: 'Cristales', descripcion: 'Cristales naturales', estado: 'Activo' },
  ]
};

const tableOptions = [
  { value: 'tiposGema', label: 'Tipos de Gema' },
  { value: 'estadosPedido', label: 'Estados de Pedido' },
  { value: 'categorias', label: 'Categorías' },
];

function RegistroTablas() {
  const [selectedTable, setSelectedTable] = useState('');
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', estado: 'Activo' });
  const [isAdding, setIsAdding] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Cargar datos cuando se selecciona una tabla
  useEffect(() => {
    if (selectedTable && tableData[selectedTable]) {
      setData([...tableData[selectedTable]]);
    } else {
      setData([]);
    }
    setEditingId(null);
    setIsAdding(false);
  }, [selectedTable]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      setData(data.filter(item => item.id !== id));
    }
  };

  const handleDownload = () => {
    if (!selectedTable) return;
    
    // Crear contenido CSV
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        `"${String(value).replace(/"/g, '\"')}"`
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Crear archivo y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTable}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      // Actualizar registro existente
      setData(data.map(item => 
        item.id === editingId ? { ...formData, id: editingId } : item
      ));
      setEditingId(null);
    } else {
      // Agregar nuevo registro
      const newId = Math.max(0, ...data.map(item => item.id)) + 1;
      setData([...data, { ...formData, id: newId }]);
      setIsAdding(false);
    }
    setFormData({ nombre: '', descripcion: '', estado: 'Activo' });
  };

  const cancelForm = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ nombre: '', descripcion: '', estado: 'Activo' });
  };

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Database size={28} className="text-blue-400" />
          <h1 className="text-3xl font-bold">📊 Registro de Tablas</h1>
        </div>
        {selectedTable && (
          <button
            onClick={() => handleDownload()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            title="Descargar tabla actual"
          >
            <Download size={18} />
            Descargar
          </button>
        )}
      </div>

      {/* Selector de Tabla */}
      <div className="relative mb-6 w-64">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex justify-between items-center bg-card border border-gray-600 rounded-lg px-4 py-2.5 text-left"
        >
          <span>{selectedTable ? tableOptions.find(t => t.value === selectedTable)?.label : 'Seleccione una tabla'}</span>
          <ChevronDown className={`transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-card border border-gray-600 rounded-lg shadow-lg">
            {tableOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  setSelectedTable(option.value);
                  setIsDropdownOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTable && (
        <>
          {/* Tabla de Datos */}
          <div className="bg-card rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === item.id ? (
                            <input
                              type="text"
                              name="nombre"
                              value={formData.nombre}
                              onChange={handleInputChange}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white"
                            />
                          ) : (
                            item.nombre
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingId === item.id ? (
                            <input
                              type="text"
                              name="descripcion"
                              value={formData.descripcion}
                              onChange={handleInputChange}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white"
                            />
                          ) : (
                            item.descripcion
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === item.id ? (
                            <select
                              name="estado"
                              value={formData.estado}
                              onChange={handleInputChange}
                              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white"
                            >
                              <option value="Activo">Activo</option>
                              <option value="Inactivo">Inactivo</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.estado === 'Activo' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {item.estado}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingId === item.id ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={handleSubmit}
                                className="text-green-400 hover:text-green-300"
                              >
                                <Save size={18} />
                              </button>
                              <button
                                onClick={cancelForm}
                                className="text-gray-400 hover:text-gray-300"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botón para agregar nuevo registro */}
          <div className="mt-4 flex justify-end">
            {!isAdding ? (
              <button
                onClick={() => {
                  setIsAdding(true);
                  setEditingId(null);
                  setFormData({ nombre: '', descripcion: '', estado: 'Activo' });
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Agregar Registro
              </button>
            ) : (
              <div className="w-full bg-card p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold mb-3">Nuevo Registro</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <input
                      type="text"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={cancelForm}
                      className="px-4 py-2 text-gray-300 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RegistroTablas;
