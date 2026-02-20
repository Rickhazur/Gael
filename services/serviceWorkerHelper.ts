// Service Worker Registration Helper
// Registra el SW y maneja actualizaciones

export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    // console.log('✅ Service Worker registrado:', registration.scope);

                    // Verificar actualizaciones cada hora
                    setInterval(() => {
                        registration.update();
                    }, 60 * 60 * 1000);

                    // Manejar actualizaciones del SW
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;

                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // Hay una nueva versión disponible
                                    showUpdateNotification();
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error('❌ Error registrando Service Worker:', error);
                });

            // Manejar cambios en el controlador del SW
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                // console.log('🔄 Service Worker actualizado, recargando...');
                window.location.reload();
            });
        });
    }
}

// Mostrar notificación de actualización disponible
function showUpdateNotification() {
    // Verificar si ya se mostró la notificación
    if (sessionStorage.getItem('updateNotificationShown')) {
        return;
    }

    const updateBanner = document.createElement('div');
    updateBanner.id = 'update-banner';
    updateBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 90%;
      animation: slideUp 0.3s ease-out;
    ">
      <div style="flex: 1;">
        <div style="font-weight: 700; margin-bottom: 4px;">
          ✨ Nueva versión disponible
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
          Actualiza para obtener las últimas mejoras
        </div>
      </div>
      <button 
        onclick="updateServiceWorker()"
        style="
          background: white;
          color: #667eea;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s;
        "
        onmouseover="this.style.transform='scale(1.05)'"
        onmouseout="this.style.transform='scale(1)'"
      >
        Actualizar
      </button>
      <button 
        onclick="dismissUpdateNotification()"
        style="
          background: transparent;
          color: white;
          border: none;
          padding: 10px;
          cursor: pointer;
          font-size: 20px;
          line-height: 1;
        "
      >
        ×
      </button>
    </div>
  `;

    // Agregar animación
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
  `;
    document.head.appendChild(style);
    document.body.appendChild(updateBanner);

    sessionStorage.setItem('updateNotificationShown', 'true');
}

// Actualizar Service Worker
window.updateServiceWorker = function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration && registration.waiting) {
                // Enviar mensaje al SW para que se active
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        });
    }
};

// Descartar notificación de actualización
window.dismissUpdateNotification = function () {
    const banner = document.getElementById('update-banner');
    if (banner) {
        banner.style.animation = 'slideDown 0.3s ease-out';
        setTimeout(() => banner.remove(), 300);
    }
};

// Limpiar caché del SW (útil para desarrollo)
export function clearServiceWorkerCache() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
                registration.active?.postMessage({ type: 'CLEAR_CACHE' });
                // console.log('🗑️ Caché del Service Worker limpiado');
            }
        });
    }
}

// Desregistrar Service Worker (útil para desarrollo)
export function unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
                registration.unregister().then(() => {
                    // console.log('🗑️ Service Worker desregistrado');
                    window.location.reload();
                });
            }
        });
    }
}

// Verificar si la app está en modo offline
export function isOffline() {
    return !navigator.onLine;
}

// Listener para cambios en el estado de conexión
export function setupConnectionListeners(onOnline?: () => void, onOffline?: () => void) {
    window.addEventListener('online', () => {
        // console.log('✅ Conexión restaurada');
        if (onOnline) onOnline();
    });

    window.addEventListener('offline', () => {
        // console.log('❌ Conexión perdida');
        if (onOffline) onOffline();
    });
}

// Solicitar permisos de notificación (para futuro)
export async function requestNotificationPermission() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            // console.log('✅ Permisos de notificación concedidos');
            return true;
        } else {
            console.log('❌ Permisos de notificación denegados');
            return false;
        }
    }
    return false;
}
