import { useState } from 'react';
import { FileText, Download, Printer } from 'lucide-react';

function GenerarDocumento() {
  const [titulo, setTitulo] = useState('');
  const [parrafo, setParrafo] = useState('');
  const [formato, setFormato] = useState('pdf');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleGenerarDocumento = (e) => {
    e.preventDefault();
    
    if (!titulo.trim() || !parrafo.trim()) {
      setMensaje({ texto: 'Por favor complete todos los campos', tipo: 'error' });
      return;
    }

    // Simulación de generación de documento
    setMensaje({ 
      texto: `Documento generado exitosamente en formato ${formato.toUpperCase()}`,
      tipo: 'exito' 
    });
    
    // Aquí iría la lógica real de generación del documento
    console.log('Generando documento:', { titulo, parrafo, formato });
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-8 text-white max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-accent mb-6 flex items-center gap-2">
        <FileText size={28} />
        Generar Documento
      </h2>
      
      <div className="bg-card p-6 rounded-xl shadow-xl">
        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-md ${
            mensaje.tipo === 'error' 
              ? 'bg-red-900/30 border-l-4 border-red-500' 
              : 'bg-green-900/30 border-l-4 border-green-500'
          }`}>
            {mensaje.texto}
          </div>
        )}
        
        <form onSubmit={handleGenerarDocumento} className="space-y-6">
          {/* Campo de Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-300 mb-1">
              Título del Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Ingrese el título del documento"
              required
            />
          </div>
          
          {/* Campo de Párrafo */}
          <div>
            <label htmlFor="parrafo" className="block text-sm font-medium text-gray-300 mb-1">
              Contenido del Documento <span className="text-red-500">*</span>
            </label>
            <textarea
              id="parrafo"
              value={parrafo}
              onChange={(e) => setParrafo(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Escriba aquí el contenido del documento..."
              required
            />
          </div>
          
          {/* Selector de Formato */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Formato de salida
              </label>
              <div className="flex space-x-4 mt-1">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-accent"
                    name="formato"
                    checked={formato === 'pdf'}
                    onChange={() => setFormato('pdf')}
                  />
                  <span className="ml-2 text-gray-300">PDF</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-accent"
                    name="formato"
                    checked={formato === 'word'}
                    onChange={() => setFormato('word')}
                  />
                  <span className="ml-2 text-gray-300">Word</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={handleImprimir}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={!titulo.trim() || !parrafo.trim()}
              >
                <Printer size={18} />
                Imprimir
              </button>
              
              <button
                type="submit"
                className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={!titulo.trim() || !parrafo.trim()}
              >
                <Download size={18} />
                Generar {formato.toUpperCase()}
              </button>
            </div>
          </div>
        </form>
        
        {/* Vista previa del documento (solo para impresión) */}
        <div className="mt-12 hidden print:block">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">{titulo || 'Título del Documento'}</h1>
          <p className="text-gray-700 whitespace-pre-line">
            {parrafo || 'Contenido del documento...'}
          </p>
          <div className="mt-8 text-sm text-gray-500">
            <p>Documento generado el {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerarDocumento;