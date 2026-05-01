import instanciaAxios from './axios'

/** Estructura de un pago devuelto por la API */
export interface Pago {
  id: number
  suscripcionId: number | null
  reservaId: number | null
  usuarioId: number
  importe: number
  moneda: string
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado'
  metodo: string | null
  referenciaExterna: string | null
  pagadoEn: string | null
  creadoEn: string
}

/** Obtiene los pagos del usuario autenticado */
export async function obtenerMisPagos(): Promise<Pago[]> {
  const respuesta = await instanciaAxios.get<Pago[]>('/pagos/mis-pagos')
  return respuesta.data
}

/** 
 * Confirma un pago por su ID
 * Solo accesible por superadmin 
 * @param id ID del pago a confirmar 
 */
export async function confirmarPago(id: number): Promise<Pago> {
  const respuesta = await instanciaAxios.patch<Pago>(`/pagos/${id}/confirmar`)
  return respuesta.data
}

/** Obtiene estadísticas de pagos de un cliente */
export async function obtenerEstadisticasPagos(clienteId: number): Promise<{
  totalPagado: number
  totalPagos: number
}> {
  const respuesta = await instanciaAxios.get(`/pagos/cliente/${clienteId}/estadisticas`)
  return respuesta.data
}