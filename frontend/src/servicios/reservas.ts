import instanciaAxios from './axios'

/** Estructura de una reserva devuelta por la API */
export interface Reserva {
    id: number
    usuarioId: number
    espacioId: number
    inicio: string
    fin: string
    estado: 'pendiente' | 'confirmada' | 'cancelada'
    tipoRecurrencia: 'ninguna' | 'diaria' | 'semanal' | 'mensual'
    finRecurrencia: string | null
    reservaPadreId: number | null
    creadoEn: string
    espacio?: {
        id: number
        nombre: string
        tipo: string
        oficina?: {
        nombre: string
        ciudad: string
        }
    }
}

/** Datos necesarios para crear una reserva */
export interface CrearReservaDto {
    espacioId: number
    inicio: string
    fin: string
    tipoRecurrencia?: 'ninguna' | 'diaria' | 'semanal' | 'mensual'
    finRecurrencia?: string
}

/** Obtiene las reservas del usuario autenticado */
export async function obtenerMisReservas(): Promise<Reserva[]> {
    const respuesta = await instanciaAxios.get<Reserva[]>('/reservas/mis-reservas')
    return respuesta.data
}

/** Crea una nueva reserva */
export async function crearReserva(dto: CrearReservaDto) {
    const respuesta = await instanciaAxios.post('/reservas', dto)
    return respuesta.data
}

/** Cancela una reserva por su ID */
export async function cancelarReserva(id: number) {
    const respuesta = await instanciaAxios.patch(`/reservas/${id}/cancelar`)
    return respuesta.data
}

/** Cancela toda la serie de una reserva recurrente */
export async function cancelarSerie(id: number) {
    const respuesta = await instanciaAxios.patch(`/reservas/${id}/cancelar-serie`)
    return respuesta.data
}