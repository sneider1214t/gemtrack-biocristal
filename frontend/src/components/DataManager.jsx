import { useState, useCallback } from 'react';
import { Upload, Download, FileText, X, CheckCircle } from 'lucide-react';

export default function DataManager() {
  const [activeTab, setActiveTab] = useState('import');
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importedFiles, setImportedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Lista de tablas disponibles para exportar
  const availableTables = [
    'Proveedores',
    'Clientes',
    'Productos',
    'Ventas',
    'Devoluciones',
    'Inventario'
  ];

  // Simular archivos importados (en una implementación real, esto vendría de una API o localStorage)
  const loadImportedFiles = useCallback(() => {
    // Aquí iría la lógica para cargar los archivos importados
    const mockFiles = [
      { id: 1, name: 'proveedores_20230813.xlsx', date: '2023-08-13', size: '245 KB' },
      { id: 2, name: 'clientes_20230812.csv', date: '2023-08-12', size: '1.2 MB' },
    ];
    setImportedFiles(mockFiles);
  }, []);

  // Cargar archivos importados al montar el componente
  useState(() => {
    loadImportedFiles();
  }, [loadImportedFiles]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;
    
    setIsImporting(true);
    
    // Simular proceso de importación
    setTimeout(() => {
      // Aquí iría la lógica real de importación
      console.log('Importing file:', selectedFile.name);
      
      // Actualizar la lista de archivos importados
      const newFile = {
        id: Date.now(),
        name: selectedFile.name,
        date: new Date().toISOString().split('T')[0],
        size: `${(selectedFile.size / 1024).toFixed(1)} KB`
      };
      
      setImportedFiles(prev => [newFile, ...prev]);
      setSelectedFile(null);
      setIsImporting(false);
      setSuccessMessage('¡Archivo importado correctamente!');
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };

  const handleExport = () => {
    if (!selectedTable) return;
    
    setIsExporting(true);
    
    // Simular proceso de exportación
    setTimeout(() => {
      // Aquí iría la lógica real de exportación
      console.log(`Exporting table: ${selectedTable}`);
      
      // Crear un enlace de descarga
      const data = `${selectedTable} exportado el ${new Date().toLocaleDateString()}`;
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTable.toLowerCase()}_export_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
      setSuccessMessage(`¡${selectedTable} exportado correctamente!`);
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Gestor de Datos</h1>
      
      {/* Pestañas */}
      <div className="flex border-b border-gray-700 mb-8">
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'import' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('import')}
        >
          <div className="flex items-center gap-2">
            <Upload size={18} />
            Importar Datos
          </div>
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'export' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('export')}
        >
          <div className="flex items-center gap-2">
            <Download size={18} />
            Exportar Datos
          </div>
        </button>
      </div>

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-900 text-green-100 rounded-lg flex items-center gap-2">
          <CheckCircle className="text-green-300" />
          {successMessage}
        </div>
      )}

      {/* Contenido de importación */}
      {activeTab === 'import' && (
        <div className="space-y-8">
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${isDragging ? 'border-accent bg-accent/10' : 'border-gray-600'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <Upload className="text-accent" size={40} />
              <h3 className="text-xl font-semibold">Arrastra y suelta tu archivo aquí</h3>
              <p className="text-gray-400 mb-4">o</p>
              <label className="bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors">
                Seleccionar archivo
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                />
              </label>
              <p className="text-sm text-gray-400">Formatos soportados: .xlsx, .xls, .csv</p>
            </div>
          </div>

          {selectedFile && (
            <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-400" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-400">
                    {Math.round(selectedFile.size / 1024)} KB
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${!selectedFile || isImporting ? 'bg-gray-600 cursor-not-allowed' : 'bg-accent hover:bg-accent/90'}`}
            >
              {isImporting ? 'Importando...' : 'Importar'}
            </button>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4">Archivos importados recientemente</h3>
            {importedFiles.length > 0 ? (
              <div className="bg-slate-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-700 text-left text-sm text-gray-300">
                      <th className="p-4">Nombre del archivo</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Tamaño</th>
                      <th className="p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedFiles.map((file) => (
                      <tr key={file.id} className="border-t border-slate-700 hover:bg-slate-750">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText className="text-blue-400" size={18} />
                            {file.name}
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">{file.date}</td>
                        <td className="p-4 text-gray-400">{file.size}</td>
                        <td className="p-4">
                          <button className="text-blue-400 hover:text-blue-300">
                            Descargar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No hay archivos importados recientemente.</p>
            )}
          </div>
        </div>
      )}

      {/* Contenido de exportación */}
      {activeTab === 'export' && (
        <div className="space-y-8">
          <div className="bg-slate-800 p-8 rounded-xl">
            <h3 className="text-xl font-semibold mb-6">Exportar datos</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Seleccionar tabla
                </label>
                <select 
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Selecciona una tabla</option>
                  {availableTables.map((table) => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Formato de exportación
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-accent cursor-pointer">
                    <input 
                      type="radio" 
                      name="exportFormat" 
                      value="excel" 
                      className="h-4 w-4 text-accent focus:ring-accent border-gray-600" 
                      defaultChecked
                    />
                    <span className="ml-3 text-gray-300">Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-accent cursor-pointer">
                    <input 
                      type="radio" 
                      name="exportFormat" 
                      value="csv" 
                      className="h-4 w-4 text-accent focus:ring-accent border-gray-600"
                    />
                    <span className="ml-3 text-gray-300">CSV (.csv)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleExport}
                  disabled={!selectedTable || isExporting}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${!selectedTable || isExporting ? 'bg-gray-600 cursor-not-allowed' : 'bg-accent hover:bg-accent/90'}`}
                >
                  {isExporting ? 'Exportando...' : 'Exportar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
