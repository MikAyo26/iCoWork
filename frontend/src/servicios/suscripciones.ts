import instanciaAxios from './axios'

/** Estructura de una suscripción devuelta por la API */
export interface Suscripcion {
  id: number
  clienteId: number
  planId: number
  fechaInicio: string
  fechaFin: string | null
  estado: 'activa' | 'cancelada' | 'expirada'
  creadoEn: string
  plan?: {
    id: number
    nombre: string
    precioMensual: number
    maxUsuarios: number | null
  }
}

/** Obtiene las suscripciones de un cliente */
export async function obtenerSuscripcionesPorCliente(clienteId: number): Promise<Suscripcion[]> {
  const respuesta = await instanciaAxios.get<Suscripcion[]>(`/suscripciones/cliente/${clienteId}`)
  return respuesta.data
}

/** Crea una nueva suscripción */
export async function crearSuscripcion(dto: {
  clienteId: number
  planId: number
  fechaInicio?: string
}): Promise<Suscripcion> {
  const respuesta = await instanciaAxios.post<Suscripcion>('/suscripciones', dto)
  return respuesta.data
}

/** Cancela una suscripción por su ID */
export async function cancelarSuscripcion(id: number): Promise<Suscripcion> {
  const respuesta = await instanciaAxios.patch<Suscripcion>(`/suscripciones/${id}/cancelar`)
  return respuesta.data
}