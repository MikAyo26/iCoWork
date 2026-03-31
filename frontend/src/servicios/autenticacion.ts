import instanciaAxios from './axios'

/** Estructura de la petición de login */
interface CredencialesLogin {
  correo: string
  contrasena: string
}

/** Estructura de la respuesta del backend al hacer login */
interface RespuestaLogin {
  accessToken: string
  usuario: {
    id: number
    nombre: string
    correo: string
    rol: string
    clienteId: number | null
  }
}

/**
 * Envía las credenciales al backend y devuelve el token JWT y los datos del usuario.
 * @param credenciales Correo y contraseña del usuario
 */
export async function iniciarSesion(credenciales: CredencialesLogin): Promise<RespuestaLogin> {
  const respuesta = await instanciaAxios.post<RespuestaLogin>('/auth/login', credenciales)
  return respuesta.data
}

/**
 * Elimina el token del localStorage y cierra la sesión del usuario.
 */
export function cerrarSesion(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

/**
 * Devuelve true si hay un token guardado en localStorage.
 */
export function estaAutenticado(): boolean {
  return !!localStorage.getItem('token')
}