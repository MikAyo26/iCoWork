import instanciaAxios from './axios'

/** Estructura de un plan devuelto por la API */
export interface Plan {
  id: number
  nombre: string
  precioMensual: number
  maxUsuarios: number | null
  descripcion: string | null
  activo: boolean
}

/** Obtiene todos los planes activos */
export async function obtenerPlanes(): Promise<Plan[]> {
  const respuesta = await instanciaAxios.get<Plan[]>('/planes')
  return respuesta.data
}

/** Crea un nuevo plan */
export async function crearPlan(dto: {
  nombre: string
  precioMensual: number
  maxUsuarios?: number
  descripcion?: string
}): Promise<Plan> {
  const respuesta = await instanciaAxios.post<Plan>('/planes', dto)
  return respuesta.data
}

/** Desactiva un plan por su ID */
export async function desactivarPlan(id: number): Promise<void> {
  await instanciaAxios.delete(`/planes/${id}`)
}