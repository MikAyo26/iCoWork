<template>
  <div class="space-y-6">

    <!-- Cabecera de bienvenida -->
    <div class="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
      <div class="flex items-center gap-4">

        <!-- Avatar con iniciales del usuario -->
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
        >
          {{ iniciales }}
        </div>

        <!-- Saludo personalizado con rol y fecha -->
        <div>
          <h1 class="text-2xl font-bold text-gray-800">
            Bienvenido, {{ primerNombre }}
          </h1>
          <div class="flex items-center gap-2 mt-1">
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="badgeRol"
            >
              {{ etiquetaRol }}
            </span>
            <span class="text-gray-400 text-sm">{{ fechaHoy }}</span>
          </div>
        </div>

      </div>
    </div>

    <!-- Tarjetas de resumen rápido -->
    <div class="flex flex-wrap justify-center gap-3">
      <div
        v-for="tarjeta in tarjetas"
        :key="tarjeta.titulo"
        class="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 w-52"
      >
        <!-- Icono de la tarjeta -->
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          :style="{ background: tarjeta.color }"
        >
          <i :class="tarjeta.icono" class="text-white text-lg"></i>
        </div>

        <!-- Título y valor de la tarjeta -->
        <div>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">{{ tarjeta.titulo }}</p>
          <p class="text-3xl font-bold text-gray-800 mt-1">{{ tarjeta.valor }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUsuarioActual } from '../composiciones/useUsuarioActual'
import {
  obtenerMisReservas,
  obtenerEspaciosPorOficina,
  obtenerNotificaciones,
  obtenerOcupacionGlobal,
  obtenerResumenCliente,
} from '../servicios/dashboard'

const { nombre, rol, iniciales, tieneRol, usuario } = useUsuarioActual()

/** Primer nombre del usuario para el saludo */
const primerNombre = computed(() => nombre.value.split(' ')[0])

/** Fecha actual formateada en español */
const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
)

/** Badge de color según el rol del usuario */
const badgeRol = computed(() => ({
  'bg-purple-100 text-purple-700': rol.value === 'superadmin',
  'bg-blue-100 text-blue-700':     rol.value === 'admin',
  'bg-gray-100 text-gray-700':     rol.value === 'empleado',
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

/**
 * Valores reactivos de las tarjetas.
 * Se inicializan con '—' y se actualizan al montar el componente.
 */
const valores = ref({
  reservasActivas: '—',
  espaciosDisponibles: '—',
  notificacionesNuevas: '—',
  usuariosActivos: '—',
  pagosEsteMes: '—',
  clientesTotales: '—',
  horasOcupacion: '—',
})

/**
 * Carga los datos reales desde el backend al montar el componente.
 * Cada petición está envuelta en try/catch para evitar que un fallo
 * bloquee el resto de tarjetas.
 */
onMounted(async () => {
  // Reservas activas — todos los roles
  try {
    const reservas = await obtenerMisReservas()
    valores.value.reservasActivas = reservas
      .filter((r: any) => r.estado === 'confirmada')
      .length.toString()
  } catch {
    valores.value.reservasActivas = '0'
  }

  // Espacios disponibles en la oficina Rambla Añaza (id: 1)
  try {
    const espacios = await obtenerEspaciosPorOficina(1)
    valores.value.espaciosDisponibles = espacios
      .filter((e: any) => e.activo)
      .length.toString()
  } catch {
    valores.value.espaciosDisponibles = '0'
  }

  // Notificaciones no leídas — todos los roles
  try {
    const notificaciones = await obtenerNotificaciones()
    valores.value.notificacionesNuevas = notificaciones
      .filter((n: any) => !n.leida)
      .length.toString()
  } catch {
    valores.value.notificacionesNuevas = '0'
  }

  // Usuarios activos del cliente — admin y superadmin
  if (tieneRol('superadmin', 'admin')) {
    try {
      const clienteId = usuario.value?.clienteId ?? 1
      const resumen = await obtenerResumenCliente(clienteId)
      valores.value.usuariosActivos = resumen.usuariosActivos?.toString() ?? '0'
    } catch {
      valores.value.usuariosActivos = '0'
    }
  }

  // Ocupación global — solo superadmin
  if (tieneRol('superadmin')) {
    try {
      const global = await obtenerOcupacionGlobal()
      valores.value.clientesTotales = global.length.toString()
      const horas = global.reduce((acc: number, c: any) => acc + (c.horasTotales ?? 0), 0)
      valores.value.horasOcupacion = `${horas.toFixed(0)}h`
    } catch {
      valores.value.clientesTotales = '0'
      valores.value.horasOcupacion = '0h'
    }
  }
})

/**
 * Tarjetas de resumen filtradas según el rol del usuario.
 * - Empleado: 3 tarjetas comunes
 * - Admin: 3 comunes + 2 de gestión
 * - Superadmin: todas
 */
const tarjetas = computed(() => {
  const comunes = [
    { titulo: 'Mis reservas activas',  valor: valores.value.reservasActivas,     icono: 'pi pi-calendar-plus', color: 'linear-gradient(135deg, #2d8f6f, #42b883)' },
    { titulo: 'Espacios disponibles',  valor: valores.value.espaciosDisponibles,  icono: 'pi pi-building',      color: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
    { titulo: 'Notificaciones nuevas', valor: valores.value.notificacionesNuevas, icono: 'pi pi-bell',          color: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  ]

  const admin = [
    { titulo: 'Usuarios activos', valor: valores.value.usuariosActivos, icono: 'pi pi-users',       color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
    { titulo: 'Pagos este mes',   valor: valores.value.pagosEsteMes,    icono: 'pi pi-credit-card', color: 'linear-gradient(135deg, #10b981, #34d399)' },
  ]

  const superadmin = [
    { titulo: 'Clientes totales',   valor: valores.value.clientesTotales, icono: 'pi pi-briefcase', color: 'linear-gradient(135deg, #ef4444, #f87171)' },
    { titulo: 'Horas de ocupación', valor: valores.value.horasOcupacion,  icono: 'pi pi-clock',     color: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
  ]

  if (tieneRol('superadmin')) return [...comunes, ...admin, ...superadmin]
  if (tieneRol('admin'))      return [...comunes, ...admin]
  return comunes
})
</script>