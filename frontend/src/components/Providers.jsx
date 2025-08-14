import { useState, useEffect } from "react";
import { Table, Plus, Edit, Trash2, Save, X } from "lucide-react";

// Helper function to save to local storage
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }
};

// Helper function to load from local storage
const loadFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from local storage:', error);
    return null;
  }
};

function Providers() {
  const [suppliers, setSuppliers] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: ''
  });

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load data
    loadSuppliers();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Cargar datos de localStorage primero para una respuesta más rápida
      const localData = loadFromLocalStorage('suppliers') || [];
      
      // Usar datos locales inmediatamente si existen
      if (localData.length > 0) {
        setSuppliers(localData);
      }
      
      // Solo intentar cargar de la API si hay conexión
      if (isOnline) {
        // No intentamos conectar con el servidor remoto ya que no está disponible
        // En una implementación real, aquí iría la URL del endpoint de la API
        console.log('Modo sin conexión al servidor remoto. Usando datos locales.');
        
        // Si no hay datos locales, mostrar mensaje informativo
        if (localData.length === 0) {
          setError('No hay datos de proveedores disponibles. Por favor, agregue un nuevo proveedor.');
        }
      } else if (localData.length === 0) {
        // Sin conexión y sin datos locales
        setError('Estás sin conexión y no hay datos locales disponibles.');
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      if (!suppliers || suppliers.length === 0) {
        setError('Ocurrió un error al cargar los proveedores. Por favor, intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.contact || !formData.email) {
      setError('Por favor complete los campos obligatorios (Nombre, Contacto, Email)');
      return;
    }

    try {
      const supplierData = {
        ...formData,
        id: editingId || Date.now().toString(),
        updatedAt: new Date().toISOString()
      };

      let updatedSuppliers;
      
      if (editingId) {
        // Update existing supplier
        updatedSuppliers = suppliers.map(s => 
          s.id === editingId ? { ...s, ...supplierData } : s
        );
      } else {
        // Add new supplier
        updatedSuppliers = [...suppliers, supplierData];
      }

      // Try to save to API if online
      if (isOnline) {
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId 
          ? `https://api.example.com/suppliers/${editingId}`
          : 'https://api.example.com/suppliers';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(supplierData),
        });

        if (!response.ok) {
          throw new Error('Error al guardar el proveedor');
        }
      }

      // Update local state and storage
      setSuppliers(updatedSuppliers);
      saveToLocalStorage('suppliers', updatedSuppliers);
      
      // Reset form
      setFormData({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: ''
      });
      setEditingId(null);
      setIsAdding(false);
      setError('');
      
    } catch (err) {
      console.error('Error saving supplier:', err);
      setError('Error al guardar el proveedor. ' + 
        (isOnline ? 'Los cambios se guardarán localmente.' : 'Estás sin conexión. Los cambios se guardarán localmente.'));
      
      // Save to local storage as fallback
      const updatedSuppliers = editingId
        ? suppliers.map(s => s.id === editingId ? { ...s, ...formData } : s)
        : [...suppliers, { ...formData, id: Date.now().toString() }];
      
      setSuppliers(updatedSuppliers);
      saveToLocalStorage('suppliers', updatedSuppliers);
      
      // Reset form
      setFormData({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: ''
      });
      setEditingId(null);
      setIsAdding(false);
    }
  };

  const handleEdit = (supplier) => {
    setFormData({
      name: supplier.name || '',
      contact: supplier.contact || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    });
    setEditingId(supplier.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este proveedor?')) return;
    
    try {
      // Try to delete from API if online
      if (isOnline) {
        const response = await fetch(`https://api.example.com/suppliers/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el proveedor');
        }
      }
      
      // Update local state and storage
      const updatedSuppliers = suppliers.filter(s => s.id !== id);
      setSuppliers(updatedSuppliers);
      saveToLocalStorage('suppliers', updatedSuppliers);
      
    } catch (err) {
      console.error('Error deleting supplier:', err);
      setError('Error al eliminar el proveedor. ' + 
        (isOnline ? 'Los cambios se guardarán localmente.' : 'Estás sin conexión. Los cambios se guardarán localmente.'));
      
      // Update local state and storage as fallback
      const updatedSuppliers = suppliers.filter(s => s.id !== id);
      setSuppliers(updatedSuppliers);
      saveToLocalStorage('suppliers', updatedSuppliers);
    }
  };

  const cancelForm = () => {
    setFormData({
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: ''
    });
    setEditingId(null);
    setIsAdding(false);
    setError('');
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold text-accent mb-6">Proveedores</h1>
      
      {/* Status and Error Messages - Temporarily removed as requested */}

      {/* Add/Edit Form */}
      {isAdding ? (
        <div className="bg-card p-6 rounded-xl shadow-xl mb-6">
          <h2 className="text-2xl font-semibold text-accent mb-6">
            {editingId ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contacto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dirección
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={cancelForm}
                className="px-6 py-2.5 border border-gray-600 rounded-lg text-white bg-transparent hover:bg-gray-700 transition-colors duration-200 flex items-center"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <Save className="mr-2 h-4 w-4" />
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8">
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            Agregar Proveedor
          </button>
        </div>
      )}

      {/* Suppliers Table */}
      <div className="bg-card p-6 rounded-xl shadow-xl">
        <div className="flex items-center mb-6">
          <Table size={24} className="mr-3 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Lista de Proveedores</h2>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Cargando proveedores...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay proveedores registrados. Comienza agregando uno nuevo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {supplier.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.contact}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Editar"
                      >
                        <Edit className="inline-block h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="inline-block h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Providers;
