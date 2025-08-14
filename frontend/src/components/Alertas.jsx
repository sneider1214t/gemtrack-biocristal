// src/components/Alertas.jsx
import { AlertCircle, Bell, Package, PlusSquare, Warehouse, TrendingDown, X, BellRing, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";

function Alertas() {
  const [activeTab, setActiveTab] = useState('alertas'); // 'alertas' o 'notificaciones'
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', title: 'Stock bajo', message: 'Quedan menos de 5 unidades de Rubí', time: 'Hace 2 horas' },
    { id: 2, type: 'info', title: 'Reabastecimiento', message: 'Pedido #1234 en camino', time: 'Ayer' },
  ]);
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'Nuevo pedido', message: 'Pedido #1234 recibido', time: 'Hace 10 min', read: false },
    { id: 2, type: 'success', title: 'Pago recibido', message: 'Se ha registrado el pago de $1,500.00', time: 'Ayer', read: true },
  ]);

  const markAsRead = (id, type) => {
    if (type === 'notification') {
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    }
  };

  const deleteItem = (id, type) => {
    if (type === 'alert') {
      setAlerts(alerts.filter(alert => alert.id !== id));
    } else {
      setNotifications(notifications.filter(notif => notif.id !== id));
    }
  };

  return (
    <div className="flex-1 p-8 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-accent">
          {activeTab === 'alertas' ? 'Alertas' : 'Notificaciones'}
        </h2>
        <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
          <button 
            onClick={() => setActiveTab('alertas')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              activeTab === 'alertas' 
                ? 'bg-accent text-white' 
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <AlertCircle size={18} />
            Alertas
          </button>
          <button 
            onClick={() => setActiveTab('notificaciones')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              activeTab === 'notificaciones' 
                ? 'bg-accent text-white' 
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Bell size={18} />
            Notificaciones
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {activeTab === 'alertas' ? (
          alerts.length > 0 ? (
            alerts.map((alert) => (
              <div key={`alert-${alert.id}`} className="bg-card p-4 rounded-xl shadow-md border-l-4 border-yellow-500">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {alert.type === 'warning' ? (
                      <AlertTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <BellRing className="text-blue-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">{alert.title}</p>
                      <p className="text-sm text-muted">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteItem(alert.id, 'alert')}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay alertas pendientes</p>
            </div>
          )
        ) : (
          notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={`notif-${notif.id}`} 
                className={`bg-card p-4 rounded-xl shadow-md border-l-4 ${
                  notif.read ? 'border-gray-700' : 'border-purple-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {notif.type === 'success' ? (
                      <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Bell className="text-purple-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">{notif.title}</p>
                      <p className="text-sm text-muted">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-500">{notif.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notif.read && (
                      <button 
                        onClick={() => markAsRead(notif.id, 'notification')}
                        className="text-gray-500 hover:text-green-400"
                        title="Marcar como leído"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteItem(notif.id, 'notification')}
                      className="text-gray-500 hover:text-red-400"
                      title="Eliminar"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay notificaciones nuevas</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Alertas;
