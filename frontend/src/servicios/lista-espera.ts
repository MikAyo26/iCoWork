import instanciaAxios from './axios'

/** Estructura de una entrada en la lista de espera */
export interface EntradaListaEspera {
    id: number
    usuarioId: number
    espacioId: number
    fechaDeseada: string
    notificadoEn: string | null
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

/** Obtiene las entradas de lista de espera del usuario autenticado */
export async function obtenerMiListaEspera(): Promise<EntradaListaEspera[]> {
    const respuesta = await instanciaAxios.get<EntradaListaEspera[]>('/lista-espera')
    return respuesta.data
}

/** Añade al usuario a la lista de espera de un espacio para una fecha */
export async function unirseListaEspera(
    espacioId: number,
    fechaDeseada: string,
): Promise<EntradaListaEspera> {
        const respuesta = await instanciaAxios.post<EntradaListaEspera>('/lista-espera', {
        espacioId,
        fechaDeseada,
    })
    return respuesta.data
}

/** Elimina una entrada de la lista de espera */
export async function salirListaEspera(id: number): Promise<void> {
    await instanciaAxios.delete(`/lista-espera/${id}`)
}