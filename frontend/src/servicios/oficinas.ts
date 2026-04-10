import instanciaAxios from './axios'

/** Estructura de una oficina devuelta por la API */
export interface Oficina {
  id: number
  nombre: string
  direccion: string
  ciudad: string
  pais: string
  totalPuestos: number
  activo: boolean
  creadoEn: string
  espacios?: { id: number; nombre: string; tipo: string }[]
}

/** Obtiene todas las oficinas */
export async function obtenerOficinas(): Promise<Oficina[]> {
  const respuesta = await instanciaAxios.get<Oficina[]>('/oficinas')
  return respuesta.data
}

/** Crea una nueva oficina */
export async function crearOficina(dto: {
  nombre: string
  direccion: string
  ciudad: string
  pais?: string
  totalPuestos: number
}): Promise<Oficina> {
  const respuesta = await instanciaAxios.post<Oficina>('/oficinas', dto)
  return respuesta.data
}

/** Actualiza parcialmente una oficina */
export async function actualizarOficina(id: number, dto: {
  nombre?: string
  direccion?: string
  ciudad?: string
  pais?: string
  totalPuestos?: number
}): Promise<Oficina> {
  const respuesta = await instanciaAxios.patch<Oficina>(`/oficinas/${id}`, dto)
  return respuesta.data
}

/** Desactiva una oficina (soft-delete) */
export async function eliminarOficina(id: number): Promise<void> {
  await instanciaAxios.delete(`/oficinas/${id}`)
}