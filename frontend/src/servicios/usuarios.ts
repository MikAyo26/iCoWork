import instanciaAxios from './axios'

/** Estructura de un usuario devuelto por la API */
export interface Usuario {
    id: number
    nombre: string
    correo: string
    departamento: string | null
    rol: 'superadmin' | 'admin' | 'empleado'
    activo: boolean
    clienteId: number | null
    cliente?: {
        id: number
        nombre: string
    }
}

/** Obtiene todos los usuarios */
export async function obtenerUsuarios(): Promise<Usuario[]> {
    const respuesta = await instanciaAxios.get<Usuario[]>('/usuarios')
    return respuesta.data
}

/** Elimina un usuario por su ID */
export async function eliminarUsuario(id: number): Promise<void> {
    await instanciaAxios.delete(`/usuarios/${id}`)
}