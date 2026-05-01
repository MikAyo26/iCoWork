import { onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'

/**
 * Instancia compartida del socket (patrón singleton).
 * Se mantiene una única conexión activa entre todos los componentes
 * que usen este composable, evitando conexiones duplicadas.
 */
let socket: Socket | null = null

/**
 * Composable que gestiona la conexión WebSocket con el backend.
 * Usa el token JWT del localStorage para autenticarse.
 * La conexión es compartida (singleton) entre todos los componentes.
 */
export function useSocket() {
  /**
   * Conecta al servidor WebSocket si no hay conexión activa.
   * Se autentica automáticamente con el token JWT del localStorage.
   * Si ya existe una conexión activa, no crea una nueva.
   */
  function conectar() {
    if (socket?.connected) return

    const token = localStorage.getItem('token')
    if (!token) return
    // Construye la URL del namespace /ws eliminando el prefijo /api de la URL base
    socket = io(`${import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3000'}/ws`, 
    {
      // Envía el token JWT como credencial de autenticación
      auth: { token: `Bearer ${token}` },
      // Fuerza el uso del WebSocket nativo, sin fallback a polling
      transports: ['websocket'],
    })

    //Evento de conexión establecida
    socket.on('connect', () => {
      console.log('[WebSocket] Conectado:', socket?.id)
    })

    //Evento de desconexión
    socket.on('disconnect', () => {
      console.log('[WebSocket] Desconectado')
    })
  }

  /** Desconecta el socket del servidor y limpia la instancia singleton.
   * Se llama al cerrar la sesión o destruir el componente principal.
   */
  function desconectar() {
    socket?.disconnect()
    socket = null
  }

  /**
   * Suscribe al cliente a las actualizaciones de disponibilidad de un espacio.
   * Emite el evento 'espacio:suscribir' al servidor con el ID del espacio.
   * @param espacioId ID del espacio a seguir
   */
  function suscribirEspacio(espacioId: number) {
    socket?.emit('espacio:suscribir', espacioId)
  }

  /**
   * Escucha cambios de disponibilidad en espacios suscritos.
   * El servidor emite 'disponibilidad:cambio' al crearse o cancelarse una reserva.
   * @param callback Función ejecutada cuando cambia la disponibilidad
   */
  function alCambiarDisponibilidad(callback: (datos: { espacioId: number; disponible: boolean }) => void) {
    socket?.on('disponibilidad:cambio', callback)
  }

  /**
   * Escucha notificaciones de lista de espera del usuario autenticado.
   * El servidor emite 'espera:disponible' cuando hay un espacio de la lista queda libre
   * @param callback Función ejecutada cuando hay un espacio disponible
   */
  function alEsperaDisponible(callback: (datos: { espacioId: number; fecha: Date }) => void) {
    socket?.on('espera:disponible', callback)
  }

  /**
   * Elimina un listener registrado sobre un evento específico del socket.
   * Debe llamarse al desmontar el componente para evitar perdidas de memoria.
   * @param evento Nombre del evento WebSocket
   * @param callback Función a eliminar del listener
   */
  function quitarListener(evento: string, callback: (...args: any[]) => void) {
    socket?.off(evento, callback)
  }

  return {
    conectar,
    desconectar,
    suscribirEspacio,
    alCambiarDisponibilidad,
    alEsperaDisponible,
    quitarListener,
  }
}