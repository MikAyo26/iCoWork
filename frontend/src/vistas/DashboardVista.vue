<template>
  <div class="space-y-6">

    <!-- Cabecera de bienvenida con avatar, nombre, rol y fecha -->
    <div class="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
      <div class="flex items-center gap-4">

        <!-- Avatar generado con las iniciales del usuario -->
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
        >
          {{ iniciales }}
        </div>

        <!-- Saludo personalizado con badge de rol y fecha actual -->
        <div>
          <h1 class="text-2xl font-bold text-gray-800">
            Bienvenido, {{ primerNombre }}
          </h1>
          <div class="flex items-center gap-2 mt-1">
            <!-- Badge de color dinámico según el rol -->
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

    <!-- Tarjetas de resumen rápido — se renderizan dinámicamente según el rol -->
    <div class="flex flex-wrap justify-center gap-3">
      <div
        v-for="tarjeta in tarjetas"
        :key="tarjeta.titulo"
        class="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 w-52"
      >
        <!-- Icono de la tarjeta con color corporativo -->
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          :style="{ background: tarjeta.color }"
        >
          <i :class="tarjeta.icono" class="text-white text-lg"></i>
        </div>

        <!-- Título y valor numérico de la tarjeta -->
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

// Servicios del dashboard para obtener métricas según el rol
import {
  obtenerMisReservas,
  obtenerEspaciosPorOficina,
  obtenerNotificaciones,
  obtenerOcupacionGlobal,
  obtenerResumenCliente,
} from '../servicios/dashboard'

// Datos del usuario autenticado desde el composable
const { nombre, rol, iniciales, tieneRol, usuario } = useUsuarioActual()

/** Primer nombre del usuario para el saludo personalizado */
const primerNombre = computed(() => nombre.value.split(' ')[0])

/** Fecha actual formateada en español con día, mes y año completos */
const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
)

/**
 * Clases CSS del badge de rol, aplicadas dinámicamente según el rol del usuario.
 * - superadmin: morado
 * - admin: azul
 * - empleado: gris
 */
const badgeRol = computed(() => ({
  'bg-purple-100 text-purple-700': rol.value === 'superadmin',
  'bg-blue-100 text-blue-700':     rol.value === 'admin',
  'bg-gray-100 text-gray-700':     rol.value === 'empleado',
}))

/**
 * Etiqueta legible del rol para mostrar en el badge.
 * Convierte el valor interno del rol en un texto visible para el usuario.
 */
const etiquetaRol = computed(() => {
  const etiquetas: Record<string, string> = {
    superadmin: 'Superadmin',
    admin: 'Administrador',
    empleado: 'Empleado',
  }
  return etiquetas[rol.value] ?? rol.value
})

/**
 * Valores reactivos de las tarjetas de resumen.
 * Se inicializan con '—' como placeholder hasta que se carguen los datos reales.
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
 * Cada petición está envuelta en try/catch independiente para evitar
 * que un fallo en una tarjeta bloquee la carga del resto.
 * Las peticiones se filtran según el rol del usuario autenticado.
 */
onMounted(async () => {

  // Reservas activas — accesible por todos los roles
  try {
    const reservas = await obtenerMisReservas()
    valores.value.reservasActivas = reservas
      .filter((r: any) => r.estado === 'confirmada')
      .length.toString()
  } catch {
    valores.value.reservasActivas = '0'
  }

  // Espacios activos de la oficina principal (id: 1)
  try {
    const espacios = await obtenerEspaciosPorOficina(1)
    valores.value.espaciosDisponibles = espacios
      .filter((e: any) => e.activo)
      .length.toString()
  } catch {
    valores.value.espaciosDisponibles = '0'
  }

  // Notificaciones no leídas — accesible por todos los roles
  try {
    const notificaciones = await obtenerNotificaciones()
    valores.value.notificacionesNuevas = notificaciones
      .filter((n: any) => !n.leida)
      .length.toString()
  } catch {
    valores.value.notificacionesNuevas = '0'
  }

  // Usuarios activos del cliente — solo admin y superadmin
  if (tieneRol('superadmin', 'admin')) {
    try {
      const clienteId = usuario.value?.clienteId ?? 1
      const resumen = await obtenerResumenCliente(clienteId)
      valores.value.usuariosActivos = resumen.usuariosActivos?.toString() ?? '0'
    } catch {
      valores.value.usuariosActivos = '0'
    }
  }

  // Métricas globales — solo superadmin
  if (tieneRol('superadmin')) {
    try {
      const global = await obtenerOcupacionGlobal()
      valores.value.clientesTotales = global.length.toString()
      // Suma de horas totales de ocupación de todos los clientes
      const horas = global.reduce((acc: number, c: any) => acc + (c.horasTotales ?? 0), 0)
      valores.value.horasOcupacion = `${horas.toFixed(0)}h`
    } catch {
      valores.value.clientesTotales = '0'
      valores.value.horasOcupacion = '0h'
    }
  }
})

/**
 * Tarjetas de resumen filtradas y construidas según el rol del usuario.
 * - Empleado: 3 tarjetas comunes (reservas, espacios, notificaciones)
 * - Admin: 3 comunes + 2 de gestión (usuarios, pagos)
 * - Superadmin: todas las anteriores + 2 globales (clientes, horas)
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