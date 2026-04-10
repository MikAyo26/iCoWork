import instanciaAxios from './axios'

/** Estructura de un cliente devuelto por la API */
export interface Cliente {
    id: number
    nombre: string
    correo: string
    telefono: string | null
    creadoEn: string
    usuarios?: {
        id: number
        nombre: string
        rol: string
    }[]
}

/** Obtiene todos los clientes */
export async function obtenerClientes(): Promise<Cliente[]> {
    const respuesta = await instanciaAxios.get<Cliente[]>('/clientes')
    return respuesta.data
}

/** Crea un nuevo cliente */
export async function crearCliente(dto: {
    nombre: string
    correo: string
    telefono?: string
}): Promise<Cliente> {
    const respuesta = await instanciaAxios.post<Cliente>('/clientes', dto)
    return respuesta.data
}

/** Actualiza parcialmente un cliente */
export async function actualizarCliente(id: number, dto: {
    nombre?: string
    correo?: string
    telefono?: string
    }): Promise<Cliente> {
        const respuesta = await instanciaAxios.patch<Cliente>(`/clientes/${id}`, dto)
        return respuesta.data
    }

/** Elimina un cliente por su ID */
export async function eliminarCliente(id: number): Promise<void> {
    await instanciaAxios.delete(`/clientes/${id}`)
}