import { useState, useCallback, useEffect } from 'react';
import { Upload, Download, FileText, X, CheckCircle } from 'lucide-react';
import axios from 'axios';

// ====== CONFIG ======
const API_HOST = 'http://localhost:3000';

// Mapeo de tablas -> endpoint real
const TABLES = [
  { key: 'Categorias',    endpoint: '/api/categorias'   },
  { key: 'Clientes',      endpoint: '/api/clientes'     },
  { key: 'Devolucion',    endpoint: '/api/devolucion'   },
  { key: 'Exportacion',   endpoint: '/api/exportacion'  },
  { key: 'Factura',       endpoint: '/api/factura'      },
  { key: 'Importacion',   endpoint: '/api/importacion'  },
  { key: 'Mantenimiento', endpoint: '/api/mantenimiento'},
  { key: 'Productos',     endpoint: '/api/productos'    },
  { key: 'Proveedores',   endpoint: '/api/proveedores'  },
  { key: 'Transaccion',   endpoint: '/api/transaccion'  },
  { key: 'Ubicacion',     endpoint: '/api/ubicacion'    },
  { key: 'Usuarios',      endpoint: '/api/usuarios'     },
];

// Axios con token si existe
const api = axios.create({
  baseURL: API_HOST,
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Convierte objetos/arrays a JSON string para que Excel/CSV no se rompa
const normalizeForExport = (rows) =>
  (rows || []).map((row) => {
    const out = {};
    Object.entries(row || {}).forEach(([k, v]) => {
      if (v === null || v === undefined) {
        out[k] = '';
      } else if (typeof v === 'object') {
        try {
          out[k] = JSON.stringify(v);
        } catch {
          out[k] = String(v);
        }
      } else {
        out[k] = v;
      }
    });
    return out;
  });

// Descarga un Blob como archivo
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function DataManager() {
  const [activeTab, setActiveTab] = useState('import');
  const [selectedTable, setSelectedTable] = useState('');
  const [exportFormat, setExportFormat] = useState('excel');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importedFiles, setImportedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Cargar mock de importados
  const loadImportedFiles = useCallback(() => {
    const mockFiles = [
      { id: 1, name: 'proveedores_20230813.xlsx', date: '2023-08-13', size: '245 KB' },
      { id: 2, name: 'clientes_20230812.csv',     date: '2023-08-12', size: '1.2 MB' },
    ];
    setImportedFiles(mockFiles);
  }, []);
  useEffect(() => { loadImportedFiles(); }, [loadImportedFiles]);

  // ====== IMPORT (mock como tu ejemplo) ======
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };
  const handleImport = () => {
    if (!selectedFile) return;
    setIsImporting(true);
    setTimeout(() => {
      const newFile = {
        id: Date.now(),
        name: selectedFile.name,
        date: new Date().toISOString().split('T')[0],
        size: `${(selectedFile.size / 1024).toFixed(1)} KB`,
      };
      setImportedFiles(prev => [newFile, ...prev]);
      setSelectedFile(null);
      setIsImporting(false);
      setSuccessMessage('¡Archivo importado correctamente!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1200);
  };

  // ====== EXPORT REAL ======
  const handleExport = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!selectedTable) return;

    const map = TABLES.find(t => t.key === selectedTable);
    if (!map) return;

    setIsExporting(true);
    try {
      // 1) Fetch
      const { data } = await api.get(map.endpoint);
      const rows = Array.isArray(data) ? data : (data ? [data] : []);
      const normalized = normalizeForExport(rows);

      // 2) Generar con SheetJS
      const XLSX = await import('xlsx');

      const ws = XLSX.utils.json_to_sheet(normalized);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, selectedTable);

      const today = new Date().toISOString().slice(0,10);
      const baseName = `${selectedTable.toLowerCase()}_${today}`;

      if (exportFormat === 'csv') {
        // CSV (UTF-8 BOM para tildes en Excel)
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `${baseName}.csv`);
      } else {
        // XLSX
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        downloadBlob(blob, `${baseName}.xlsx`);
      }

      setSuccessMessage(`¡${selectedTable} exportado correctamente! (${normalized.length} filas)`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error exportando:', err);
      setErrorMessage(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Error al exportar datos'
      );
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Gestor de Datos</h1>

      {/* Tabs */}
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

      {/* Mensajes */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-900 text-green-100 rounded-lg flex items-center gap-2">
          <CheckCircle className="text-green-300" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-900 text-red-100 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* IMPORT */}
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
              <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white">
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

      {/* EXPORT */}
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
                  {TABLES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.key}
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
                      checked={exportFormat === 'excel'}
                      onChange={() => setExportFormat('excel')}
                      className="h-4 w-4 text-accent focus:ring-accent border-gray-600"
                    />
                    <span className="ml-3 text-gray-300">Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-accent cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={() => setExportFormat('csv')}
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
