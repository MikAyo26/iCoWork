<template>
  <aside class="w-64 bg-gray-900 flex flex-col h-full">

    <!-- Logo -->
    <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
      <img src="../assets/logo.png" alt="iCoWork" class="w-8" />
      <span class="text-white font-bold text-lg">iCoWork</span>
    </div>

    <!-- Avatar y datos del usuario -->
    <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
      <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)">
        {{ iniciales }}
      </div>
      <div class="overflow-hidden">
        <p class="text-white text-sm font-medium truncate">{{ nombre }}</p>
        <span class="text-xs px-2 py-0.5 rounded-full font-medium"
          :class="badgeRol">
          {{ etiquetaRol }}
        </span>
      </div>
    </div>

    <!-- Navegación -->
    <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
      <template v-for="opcion in menuFiltrado" :key="opcion.nombre">
        <RouterLink
          :to="opcion.ruta"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150"
          :class="esRutaActiva(opcion.ruta)
            ? 'bg-green-600 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
        >
          <i :class="opcion.icono" class="text-base w-5 text-center"></i>
          <span>{{ opcion.nombre }}</span>
        </RouterLink>
      </template>
    </nav>

    <!-- Cerrar sesión -->
    <div class="px-4 py-4 border-t border-gray-800">
      <button
        @click="salir"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150 w-full"
      >
        <i class="pi pi-sign-out text-base w-5 text-center"></i>
        <span>Cerrar sesión</span>
      </button>
    </div>

  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useUsuarioActual } from '../composiciones/useUsuarioActual'
import { cerrarSesion } from '../servicios/autenticacion'

const route = useRoute()
const router = useRouter()
const { nombre, rol, iniciales, tieneRol } = useUsuarioActual()

/** Definición completa del menú con control de roles */
const menu = [
  { nombre: 'Dashboard',       ruta: '/dashboard',     icono: 'pi pi-home',         roles: ['superadmin', 'admin', 'empleado'] },
  { nombre: 'Perfil', ruta: '/perfil', icono: 'pi pi-user', roles: ['superadmin', 'admin', 'empleado'] },
  { nombre: 'Mis Reservas',    ruta: '/reservas',       icono: 'pi pi-calendar',     roles: ['superadmin', 'admin', 'empleado'] },
  { nombre: 'Espacios',        ruta: '/espacios',       icono: 'pi pi-building',     roles: ['superadmin', 'admin', 'empleado'] },
  { nombre: 'Lista de espera', ruta: '/lista-espera',   icono: 'pi pi-clock',        roles: ['superadmin', 'admin', 'empleado'] },
  { nombre: 'Notificaciones',  ruta: '/notificaciones', icono: 'pi pi-bell',         roles: ['superadmin', 'admin', 'empleado'] },
  { nombre: 'Usuarios',        ruta: '/usuarios',       icono: 'pi pi-users',        roles: ['superadmin', 'admin'] },
  { nombre: 'Pagos',           ruta: '/pagos',          icono: 'pi pi-credit-card',  roles: ['superadmin', 'admin'] },
  { nombre: 'Estadísticas',    ruta: '/estadisticas',   icono: 'pi pi-chart-bar',    roles: ['superadmin', 'admin'] },
  { nombre: 'Clientes',        ruta: '/clientes',       icono: 'pi pi-briefcase',    roles: ['superadmin'] },
  { nombre: 'Oficinas',        ruta: '/oficinas',       icono: 'pi pi-map-marker',   roles: ['superadmin'] },
  { nombre: 'Planes',          ruta: '/planes',         icono: 'pi pi-tag',          roles: ['superadmin'] },
]

/** Menú filtrado según el rol del usuario actual */
const menuFiltrado = computed(() =>
  menu.filter((opcion) => tieneRol(...opcion.roles))
)

/** Badge de color según el rol */
const badgeRol = computed(() => ({
  'bg-purple-500 text-white': rol.value === 'superadmin',
  'bg-blue-500 text-white':   rol.value === 'admin',
  'bg-gray-600 text-white':   rol.value === 'empleado',
}))

/** Etiqueta legible del rol */
const etiquetaRol = computed(() => {
  const etiquetas: Record<string, string> = {
    superadmin: 'Superadmin',
    admin: 'Administrador',
    empleado: 'Empleado',
  }
  return etiquetas[rol.value] ?? rol.value
})

/** Comprueba si una ruta está activa para resaltarla en el menú */
function esRutaActiva(ruta: string): boolean {
  return route.path === ruta
}

/** Cierra la sesión y redirige al login */
function salir() {
  cerrarSesion()
  router.push('/login')
}
</script>