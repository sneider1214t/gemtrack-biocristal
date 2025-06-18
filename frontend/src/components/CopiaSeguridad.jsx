function CopiaSeguridad() {
  return (
    <div className="flex-1 p-8 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6">Copia de Seguridad</h2>

      <div className="bg-card p-6 rounded-2xl shadow-xl max-w-lg">
        <p className="text-muted mb-2">Última copia realizada:</p>
        <p className="text-purple-400 text-lg font-semibold mb-6">
          📅 14 de mayo de 2025 - 10:32 a.m.
        </p>

        <button className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-semibold transition-all">
          Realizar nueva copia ahora
        </button>

        <p className="text-muted mt-4 text-sm">Te recomendamos realizar una copia cada semana.</p>
      </div>
    </div>
  );
}

export default CopiaSeguridad;
