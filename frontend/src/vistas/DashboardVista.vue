<template>
  <div class="space-y-6">

    <!-- Cabecera de bienvenida -->
    <div class="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
      <div class="flex items-center gap-4">

        <!-- Avatar -->
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
        >
          {{ iniciales }}
        </div>

        <!-- Saludo -->
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
<div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
  <div
    v-for="tarjeta in tarjetas"
    :key="tarjeta.titulo"
    class="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3"
  >
    <div
      class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      :style="{ background: tarjeta.color }"
    >
      <i :class="tarjeta.icono" class="text-white text-lg"></i>
    </div>
    <div>
      <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">{{ tarjeta.titulo }}</p>
      <p class="text-3xl font-bold text-gray-800 mt-1">{{ tarjeta.valor }}</p>
    </div>
  </div>
</div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUsuarioActual } from '../composiciones/useUsuarioActual'

const { nombre, rol, iniciales, tieneRol } = useUsuarioActual()

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

/** Badge de color según el rol */
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

/** Tarjetas de resumen según el rol del usuario */
const tarjetas = computed(() => {
  const comunes = [
    { titulo: 'Mis reservas activas',  valor: '—', icono: 'pi pi-calendar-plus', color: 'linear-gradient(135deg, #2d8f6f, #42b883)' },
    { titulo: 'Espacios disponibles',  valor: '—', icono: 'pi pi-building',       color: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
    { titulo: 'Notificaciones nuevas', valor: '—', icono: 'pi pi-bell',           color: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  ]

  const admin = [
    { titulo: 'Usuarios activos',   valor: '—', icono: 'pi pi-users',       color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
    { titulo: 'Pagos este mes',     valor: '—', icono: 'pi pi-credit-card', color: 'linear-gradient(135deg, #10b981, #34d399)' },
  ]

  const superadmin = [
    { titulo: 'Clientes totales',   valor: '—', icono: 'pi pi-briefcase',   color: 'linear-gradient(135deg, #ef4444, #f87171)' },
    { titulo: 'Ingresos del mes',   valor: '—', icono: 'pi pi-chart-line',  color: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
  ]

  if (tieneRol('superadmin')) return [...comunes, ...admin, ...superadmin]
  if (tieneRol('admin'))      return [...comunes, ...admin]
  return comunes
})

/** Número de columnas del grid según cantidad de tarjetas */
const gridCols = computed(() => {
  const n = tarjetas.value.length
  if (n <= 3) return 'grid-cols-1 sm:grid-cols-3'
  if (n <= 5) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
})
</script>