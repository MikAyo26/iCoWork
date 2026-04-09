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

/** Datos necesarios para crear un usuario */
export interface CrearUsuarioDto {
    nombre: string
    correo: string
    contrasena: string
    rol?: 'superadmin' | 'admin' | 'empleado'
    clienteId?: number
    departamento?: string
    }

/** Crea un nuevo usuario */
export async function crearUsuario(dto: CrearUsuarioDto): Promise<Usuario> {
    const respuesta = await instanciaAxios.post<Usuario>('/usuarios', dto)
    return respuesta.data
}

/** Datos para actualizar un usuario — todos opcionales */
export interface ActualizarUsuarioDto {
    nombre?: string
    correo?: string
    contrasena?: string
    departamento?: string
    rol?: 'superadmin' | 'admin' | 'empleado'
    clienteId?: number
}

/** Actualiza parcialmente un usuario */
export async function actualizarUsuario(id: number, dto: ActualizarUsuarioDto): Promise<Usuario> {
    const respuesta = await instanciaAxios.patch<Usuario>(`/usuarios/${id}`, dto)
    return respuesta.data
}