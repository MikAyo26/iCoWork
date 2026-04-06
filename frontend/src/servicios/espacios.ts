import instanciaAxios from './axios'

/** Estructura de un espacio devuelto por la API */
export interface Espacio {
    id: number
    nombre: string
    tipo: 'puesto' | 'sala_juntas' | 'cabina' | 'otro'
    capacidad: number
    descripcion: string | null
    activo: boolean
    oficinaId: number
    oficina: {
        id: number
        nombre: string
        ciudad: string
    }
}

/** Obtiene todos los espacios de una oficina */
export async function obtenerEspaciosPorOficina(oficinaId: number): Promise<Espacio[]> {
    const respuesta = await instanciaAxios.get<Espacio[]>(`/espacios/oficina/${oficinaId}`)
    return respuesta.data
}

/** Verifica la disponibilidad de un espacio en un rango horario */
export async function verificarDisponibilidad(
    espacioId: number,
    inicio: string,
    fin: string,
): Promise<boolean> {
        const respuesta = await instanciaAxios.get<{ disponible: boolean }>(
        `/espacios/disponibilidad`,
        { params: { espacioId, inicio, fin } },
    )
    return respuesta.data.disponible
}