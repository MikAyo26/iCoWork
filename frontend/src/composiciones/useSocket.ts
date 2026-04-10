import { onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'

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
   */
  function conectar() {
    if (socket?.connected) return

    const token = localStorage.getItem('token')
    if (!token) return

    socket = io(`${import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3000'}/ws`, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      console.log('[WebSocket] Conectado:', socket?.id)
    })

    socket.on('disconnect', () => {
      console.log('[WebSocket] Desconectado')
    })
  }

  /** Desconecta el socket y limpia la instancia */
  function desconectar() {
    socket?.disconnect()
    socket = null
  }

  /**
   * Suscribe al cliente a las actualizaciones de disponibilidad de un espacio.
   * @param espacioId ID del espacio a seguir
   */
  function suscribirEspacio(espacioId: number) {
    socket?.emit('espacio:suscribir', espacioId)
  }

  /**
   * Escucha cambios de disponibilidad en espacios suscritos.
   * @param callback Función ejecutada cuando cambia la disponibilidad
   */
  function alCambiarDisponibilidad(callback: (datos: { espacioId: number; disponible: boolean }) => void) {
    socket?.on('disponibilidad:cambio', callback)
  }

  /**
   * Escucha notificaciones de lista de espera del usuario autenticado.
   * @param callback Función ejecutada cuando hay un espacio disponible
   */
  function alEsperaDisponible(callback: (datos: { espacioId: number; fecha: Date }) => void) {
    socket?.on('espera:disponible', callback)
  }

  /**
   * Elimina un listener de un evento específico.
   * @param evento Nombre del evento
   * @param callback Función a eliminar
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