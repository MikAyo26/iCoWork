import { createRouter, createWebHistory } from 'vue-router'
import DiseñoAuth from '../diseños/DiseñoAuth.vue'
import DiseñoApp from '../diseños/DiseñoApp.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      /** Layout limpio para rutas públicas */
      path: '/',
      component: DiseñoAuth,
      meta: { soloInvitados: true },
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('../vistas/LoginVista.vue'),
        },
      ],
    },
    {
      /** Layout principal con sidebar para rutas privadas */
      path: '/',
      component: DiseñoApp,
      meta: { requiereAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../vistas/DashboardVista.vue'),
          meta: { roles: ['superadmin', 'admin', 'empleado'] },
        },
        {
          path: 'perfil',
          name: 'perfil',
          component: () => import('../vistas/PerfilVista.vue'),
          meta: { roles: ['superadmin', 'admin', 'empleado'] },
        },
        {
          path: 'reservas',
          name: 'reservas',
          component: () => import('../vistas/ReservasVista.vue'),
          meta: { roles: ['superadmin', 'admin', 'empleado'] },
        },
        {
          path: 'espacios',
          name: 'espacios',
          component: () => import('../vistas/EspaciosVista.vue'),
          meta: { roles: ['superadmin', 'admin', 'empleado'] },
        },
        {
          path: 'lista-espera',
          name: 'lista-espera',
          component: () => import('../vistas/ListaEsperaVista.vue'),
          meta: { roles: ['superadmin', 'admin', 'empleado'] },
        },
        {
          path: 'notificaciones',
          name: 'notificaciones',
          component: () => import('../vistas/NotificacionesVista.vue'),
          meta: { roles: ['superadmin', 'admin', 'empleado'] },
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('../vistas/UsuariosVista.vue'),
          meta: { roles: ['superadmin', 'admin'] },
        },
        {
          path: 'pagos',
          name: 'pagos',
          component: () => import('../vistas/PagosVista.vue'),
          meta: { roles: ['superadmin', 'admin'] },
        },
        {
          path: 'estadisticas',
          name: 'estadisticas',
          component: () => import('../vistas/EstadisticasVista.vue'),
          meta: { roles: ['superadmin', 'admin'] },
        },
        {
          path: 'clientes',
          name: 'clientes',
          component: () => import('../vistas/ClientesVista.vue'),
          meta: { roles: ['superadmin'] },
        },
        {
          path: 'oficinas',
          name: 'oficinas',
          component: () => import('../vistas/OficinasVista.vue'),
          meta: { roles: ['superadmin'] },
        },
        {
          path: 'planes',
          name: 'planes',
          component: () => import('../vistas/PlanesVista.vue'),
          meta: { roles: ['superadmin'] },
        },
      ],
    },
  ],
})

/**
 * Guard global de navegación — se ejecuta antes de cada cambio de ruta.
 *
 * Lógica:
 * 1. Ruta privada sin token → redirige a /login
 * 2. Ruta de invitados con token → redirige a /dashboard
 * 3. Ruta con roles definidos → comprueba que el usuario tiene permiso
 * 4. Sin permiso → redirige al dashboard
 */
router.beforeEach((destino, _origen, siguiente) => {
  const token = localStorage.getItem('token')

  // Ruta privada sin token → redirige al login
  if (destino.meta.requiereAuth && !token) {
    return siguiente({ name: 'login' })
  }

  // Ruta de invitados con sesión activa → redirige al dashboard
  if (destino.meta.soloInvitados && token) {
    return siguiente({ name: 'dashboard' })
  }

  // Comprueba el rol del usuario si la ruta tiene roles definidos
  const rolesPermitidos = destino.meta.roles as string[] | undefined
  if (rolesPermitidos && token) {
    const datosUsuario = localStorage.getItem('usuario')
    const rol = datosUsuario ? (JSON.parse(datosUsuario) as { rol: string }).rol : ''

    if (!rolesPermitidos.includes(rol)) {
      /** Rol sin permiso → redirige al dashboard */
      return siguiente({ name: 'dashboard' })
    }
  }

  siguiente()
})

export default router