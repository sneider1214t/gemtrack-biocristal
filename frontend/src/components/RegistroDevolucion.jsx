import { useState, useEffect } from "react";
import { ArrowLeftCircle, Save, X, Edit, Trash2, AlertCircle, CheckCircle } from "lucide-react";

function RegistroDevolucion() {
  // Estado para el formulario
  const [formData, setFormData] = useState({
    producto: '',
    fechaDevolucion: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    motivo: '',
    estado: 'Pendiente',
    observaciones: ''
  });

  // Estado para la lista de devoluciones
  const [devoluciones, setDevoluciones] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar datos guardados localmente al iniciar
  useEffect(() => {
    const savedDevoluciones = localStorage.getItem('devoluciones');
    if (savedDevoluciones) {
      setDevoluciones(JSON.parse(savedDevoluciones));
    }

    // Escuchar cambios en la conexión
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  // Guardar en localStorage cuando cambien las devoluciones
  useEffect(() => {
    localStorage.setItem('devoluciones', JSON.stringify(devoluciones));
  }, [devoluciones]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.producto || !formData.fechaDevolucion || !formData.motivo) {
      setError('Por favor complete todos los campos obligatorios');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (editingId !== null) {
      // Actualizar devolución existente
      setDevoluciones(devoluciones.map(item => 
        item.id === editingId ? { ...formData, id: editingId } : item
      ));
      setSuccess('Devolución actualizada correctamente');
    } else {
      // Crear nueva devolución
      const nuevaDevolucion = {
        ...formData,
        id: Date.now(),
        fechaRegistro: new Date().toISOString()
      };
      setDevoluciones([...devoluciones, nuevaDevolucion]);
      setSuccess('Devolución registrada correctamente');
    }

    // Limpiar formulario
    setFormData({
      producto: '',
      fechaDevolucion: new Date().toISOString().split('T')[0],
      fechaVencimiento: '',
      motivo: '',
      estado: 'Pendiente',
      observaciones: ''
    });
    setEditingId(null);
    
    // Limpiar mensajes después de 5 segundos
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 5000);
  };

  const handleEdit = (devolucion) => {
    setFormData(devolucion);
    setEditingId(devolucion.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta devolución?')) {
      setDevoluciones(devoluciones.filter(item => item.id !== id));
      setSuccess('Devolución eliminada correctamente');
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  const cancelEdit = () => {
    setFormData({
      producto: '',
      fechaDevolucion: new Date().toISOString().split('T')[0],
      fechaVencimiento: '',
      motivo: '',
      estado: 'Pendiente',
      observaciones: ''
    });
    setEditingId(null);
  };

  // Verificar vencimientos próximos
  const checkVencimientos = () => {
    const hoy = new Date();
    const vencimientosProximos = devoluciones.filter(devolucion => {
      if (!devolucion.fechaVencimiento) return false;
      const fechaVencimiento = new Date(devolucion.fechaVencimiento);
      const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
      return diasRestantes <= 7 && diasRestantes >= 0;
    });

    return vencimientosProximos;
  };

  const vencimientosProximos = checkVencimientos();

  return (
    <div className="p-6 text-white">
      {/* Título y estado de conexión */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ArrowLeftCircle size={28} className="text-red-500" />
          <h1 className="text-3xl font-bold">🔄 Registro de Devoluciones</h1>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isOnline ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {isOnline ? 'En línea' : 'Sin conexión - Modo local'}
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {vencimientosProximos.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg">
          <h3 className="font-semibold mb-2">⚠️ Vencimientos próximos</h3>
          <ul className="list-disc pl-5 space-y-1">
            {vencimientosProximos.map((item, index) => (
              <li key={index}>
                {item.producto} - Vence el {new Date(item.fechaVencimiento).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-card rounded-xl shadow-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId !== null ? 'Editar Devolución' : 'Nueva Devolución'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Producto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="producto"
              value={formData.producto}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="Nombre del producto"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha de Devolución <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fechaDevolucion"
              value={formData.fechaDevolucion}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              name="fechaVencimiento"
              value={formData.fechaVencimiento}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Completada">Completada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Motivo de la Devolución <span className="text-red-500">*</span>
            </label>
            <textarea
              name="motivo"
              value={formData.motivo}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              rows="2"
              placeholder="Describa el motivo de la devolución"
              required
            ></textarea>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              rows="2"
              placeholder="Observaciones adicionales"
            ></textarea>
          </div>

          <div className="md:col-span-2 flex justify-end space-x-3 pt-2">
            {editingId !== null && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              {editingId !== null ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de devoluciones */}
      <div className="bg-card rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Historial de Devoluciones</h2>
          <p className="text-sm text-gray-400">
            {devoluciones.length} {devoluciones.length === 1 ? 'registro' : 'registros'} encontrados
          </p>
        </div>
        
        {devoluciones.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    F. Devolución
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    F. Vencimiento
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
                {devoluciones.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{item.producto}</div>
                      <div className="text-sm text-gray-400">
                        {item.motivo.length > 30 ? `${item.motivo.substring(0, 30)}...` : item.motivo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(item.fechaDevolucion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.fechaVencimiento ? new Date(item.fechaVencimiento).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.estado === 'Completada' ? 'bg-green-500/20 text-green-400' :
                        item.estado === 'Rechazada' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-400">
            No hay devoluciones registradas. Empiece agregando una nueva devolución.
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistroDevolucion;
