import instanciaAxios from './axios'

/** Estructura de una notificación devuelta por la API */
export interface Notificacion {
    id: number
    usuarioId: number
    tipo: 'reserva_confirmada' | 'reserva_cancelada' | 'espera_disponible' | 'recibo_pago' | 'otro'
    titulo: string
    cuerpo: string | null
    leida: boolean
    enviadoEn: string
}

/** Obtiene todas las notificaciones del usuario autenticado */
export async function obtenerNotificaciones(): Promise<Notificacion[]> {
    const respuesta = await instanciaAxios.get<Notificacion[]>('/notificaciones')
    return respuesta.data
}

/** Marca una notificación como leída */
export async function marcarLeida(id: number): Promise<Notificacion> {
    const respuesta = await instanciaAxios.patch<Notificacion>(`/notificaciones/${id}/leer`)
    return respuesta.data
}

/** Marca todas las notificaciones del usuario como leídas */
export async function marcarTodasLeidas(): Promise<void> {
    await instanciaAxios.patch('/notificaciones/leer-todas')
}