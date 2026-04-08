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
      /** Layout limpio para rutas públicas (login) */
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
        },
        {
          path: 'espacios',
          name: 'espacios',
          component: () => import('../vistas/EspaciosVista.vue'),
        },
        {
          path: 'reservas',
          name: 'reservas',
          component: () => import('../vistas/ReservasVista.vue'),
        },
        {
          path: 'notificaciones',
          name: 'notificaciones',
          component: () => import('../vistas/NotificacionesVista.vue'),
        },
      ],
    },
  ],
})

/**
 * Guard global de navegación — se ejecuta antes de cada cambio de ruta.
 *
 * Lógica:
 * 1. Si la ruta destino requiere autenticación y no hay token → redirige a /login
 * 2. Si la ruta destino es solo para invitados y hay token activo → redirige a /dashboard
 * 3. En cualquier otro caso → permite la navegación normalmente
 *
 * @param destino  - Ruta a la que el usuario intenta navegar
 * @param _origen  - Ruta desde la que viene (no utilizada)
 * @param siguiente - Función que autoriza o redirige la navegación
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

  // Navegación permitida
  siguiente()
})

export default router