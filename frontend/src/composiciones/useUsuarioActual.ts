import { computed } from 'vue'

/** Estructura del usuario guardado en localStorage tras el login */
interface UsuarioActual {
  id: number
  nombre: string
  correo: string
  rol: 'superadmin' | 'admin' | 'empleado'
  clienteId: number | null
}

/**
 * Composable que expone los datos del usuario autenticado
 * almacenados en localStorage tras el login.
 */
export function useUsuarioActual() {
  /** Usuario deserializado del localStorage */
  const usuario = computed<UsuarioActual | null>(() => {
    const datos = localStorage.getItem('usuario')
    if (!datos) return null
    return JSON.parse(datos) as UsuarioActual
  })

  /** Nombre completo del usuario */
  const nombre = computed(() => usuario.value?.nombre ?? '')

  /** Rol del usuario */
  const rol = computed(() => usuario.value?.rol ?? '')

  /** Iniciales del nombre para el avatar */
const iniciales = computed(() => {
  if (!usuario.value?.nombre) return '?'
  return usuario.value.nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
})

  /** Comprueba si el usuario tiene alguno de los roles indicados */
  function tieneRol(...roles: string[]): boolean {
    return roles.includes(usuario.value?.rol ?? '')
  }

  return { usuario, nombre, rol, iniciales, tieneRol }
}