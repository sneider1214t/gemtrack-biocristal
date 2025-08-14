import { Bell } from "lucide-react";

function Notificaciones() {
  return (
    <div className="flex-1 p-8 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6">Notificaciones</h2>
      
      <div className="space-y-4">
        <div className="bg-card p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <Bell className="text-purple-400" />
            <div>
              <p className="font-semibold">Stock bajo</p>
              <p className="text-sm text-muted">Se requiere reabastecimiento de Rubí</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <Bell className="text-yellow-400" />
            <div>
              <p className="font-semibold">Nuevo pedido</p>
              <p className="text-sm text-muted">Pedido #123456 recibido</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notificaciones;
