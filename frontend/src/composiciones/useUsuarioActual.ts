import { computed } from 'vue'

/** Estructura del usuario guardado en localStorage tras el login */
interface UsuarioActual {
  id: number
  nombre: string
  correo: string
  rol: 'superadmin' | 'admin' | 'empleado'
  /** ID del cliente al que pertenece el usuario (null para superadmin) */
  clienteId: number | null
}

/**
 * Composable que expone los datos del usuario autenticado
 * almacenados en localStorage tras el login.
 * Se utiliza en cualquier componente o vista que necesite
 * acceder al usuario activo o comprobar su rol.
 */
export function useUsuarioActual() {
  /** Usuario deserializado del localStorage.
   * Devuelve null si no existe sesion activa.
  */
  const usuario = computed<UsuarioActual | null>(() => {
    const datos = localStorage.getItem('usuario')
    if (!datos) return null
    return JSON.parse(datos) as UsuarioActual
  })

  /** Nombre completo del usuario autenticado */
  const nombre = computed(() => usuario.value?.nombre ?? '')

  /** Rol del usuario autenticado */
  const rol = computed(() => usuario.value?.rol ?? '')

  /** Iniciales del nombre para mostrar en el avatar.
   * Toma las dos primeras palabras del nombre y extrae su primera letra.
   * Devuelve '?' si no hay usuario activo.
   */
const iniciales = computed(() => {
  if (!usuario.value?.nombre) return '?'
  return usuario.value.nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
})

  /** Comprueba si el usuario tiene alguno de los roles indicados 
   * @param roles - Lista de roles permitidos a comprobar
   * @returns true si el usuario tiene alguno de los roles indicados.
  */
  function tieneRol(...roles: string[]): boolean {
    return roles.includes(usuario.value?.rol ?? '')
  }

  return { usuario, nombre, rol, iniciales, tieneRol }
}