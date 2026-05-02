<template>
  <div class="space-y-6">

    <!-- Cabecera con título y botón de exportación CSV -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Estadísticas</h1>
        <p class="text-sm text-gray-400 mt-1">Análisis de ocupación y uso de espacios</p>
      </div>

      <!-- Botón de exportación — visible solo para admin y superadmin -->
      <button
        v-if="tieneRol('superadmin', 'admin') && clienteId"
        @click="exportarCsv"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
      >
        <i class="pi pi-download"></i>
        Exportar CSV
      </button>
    </div>

    <!-- Indicador de carga mientras se obtienen los datos -->
    <div v-if="cargando" class="flex justify-center py-20">
      <i class="pi pi-spin pi-spinner text-green-500 text-3xl"></i>
    </div>

    <!-- Mensaje de error si falla la carga de estadísticas -->
    <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
      <p class="text-red-500 text-sm">{{ error }}</p>
    </div>

    <template v-else>

      <!-- Gráfica de barras — espacios más reservados (admin y superadmin) -->
      <div
        v-if="tieneRol('superadmin', 'admin') && datosEspacios.labels.length > 0"
        class="bg-white rounded-2xl shadow-sm p-6"
      >
        <h2 class="text-base font-semibold text-gray-700 mb-4">Espacios más reservados</h2>
        <Chart
          type="bar"
          :data="datosEspacios"
          :options="opcionesBarras"
          class="h-64"
        />
      </div>

      <!-- Gráfica de línea — franjas horarias más solicitadas (solo superadmin) -->
      <div
        v-if="tieneRol('superadmin') && datosHorasPico.labels.length > 0"
        class="bg-white rounded-2xl shadow-sm p-6"
      >
        <h2 class="text-base font-semibold text-gray-700 mb-4">Franjas horarias más solicitadas</h2>
        <Chart
          type="line"
          :data="datosHorasPico"
          :options="opcionesLinea"
          class="h-64"
        />
      </div>

      <!-- Gráfica de dona — ocupación global por cliente (solo superadmin) -->
      <div
        v-if="tieneRol('superadmin') && datosOcupacion.labels.length > 0"
        class="bg-white rounded-2xl shadow-sm p-6"
      >
        <h2 class="text-base font-semibold text-gray-700 mb-4">Ocupación global por cliente</h2>
        <Chart
          type="doughnut"
          :data="datosOcupacion"
          :options="opcionesDona"
          class="h-64"
        />
      </div>

      <!-- Tabla de asistencia de empleados (admin y superadmin) -->
      <div
        v-if="tieneRol('superadmin', 'admin') && asistencia.length > 0"
        class="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-gray-50">
          <h2 class="text-base font-semibold text-gray-700">Asistencia de empleados</h2>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Empleado</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Departamento</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reservas</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Horas totales</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="empleado in asistencia"
              :key="empleado.usuarioId"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 font-medium text-gray-800">{{ empleado.nombre }}</td>
              <!-- Muestra '—' si el empleado no tiene departamento asignado -->
              <td class="px-6 py-4 text-gray-500 text-xs">{{ empleado.departamento ?? '—' }}</td>
              <td class="px-6 py-4 text-gray-700">{{ empleado.totalReservas }}</td>
              <td class="px-6 py-4 text-gray-700">{{ empleado.horasTotales }}h</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mensaje informativo para empleados sin acceso a estadísticas -->
      <div
        v-if="!tieneRol('superadmin', 'admin')"
        class="text-center py-20 text-gray-400"
      >
        <i class="pi pi-chart-bar text-4xl mb-3 block"></i>
        <p class="text-sm">Las estadísticas están disponibles para administradores</p>
      </div>

    </template>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Chart from 'primevue/chart'
import { useUsuarioActual } from '../composiciones/useUsuarioActual'
import instanciaAxios from '../servicios/axios'

const { tieneRol, usuario } = useUsuarioActual()

/** ID del cliente del usuario autenticado — null para superadmin sin cliente asignado */
const clienteId = computed(() => usuario.value?.clienteId ?? null)

/** Indica si la carga inicial está en curso */
const cargando = ref(true)

/** Mensaje de error general de la vista */
const error = ref('')

/** Datos de asistencia de empleados para la tabla */
const asistencia = ref<{
  usuarioId: number
  nombre: string
  departamento: string | null
  totalReservas: number
  horasTotales: number
}[]>([])

/** Datos para la gráfica de barras de espacios más reservados */
const datosEspacios = ref<{ labels: string[]; datasets: object[] }>({ labels: [], datasets: [] })

/** Datos para la gráfica de línea de horas pico */
const datosHorasPico = ref<{ labels: string[]; datasets: object[] }>({ labels: [], datasets: [] })

/** Datos para la gráfica de dona de ocupación global */
const datosOcupacion = ref<{ labels: string[]; datasets: object[] }>({ labels: [], datasets: [] })

/** Opciones de Chart.js para la gráfica de barras */
const opcionesBarras = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 } },
  },
}

/** Opciones de Chart.js para la gráfica de línea de horas pico */
const opcionesLinea = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { title: { display: true, text: 'Hora del día' } },
    y: { beginAtZero: true, ticks: { stepSize: 1 } },
  },
}

/** Opciones de Chart.js para la gráfica de dona */
const opcionesDona = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right' } },
}

/**
 * Carga todos los datos de estadísticas al montar el componente.
 * Si el usuario no tiene rol admin o superadmin, finaliza sin cargar datos.
 * Las peticiones al dashboard de horas pico y ocupación global
 * solo se ejecutan si el usuario es superadmin.
 */
onMounted(async () => {
  // Si el usuario no tiene permisos, no cargar datos
  if (!tieneRol('superadmin', 'admin')) {
    cargando.value = false
    return
  }

  try {
    const id = clienteId.value ?? 1

    // Espacios más reservados del cliente
    const resumen = await instanciaAxios.get(`/dashboard/cliente/${id}`)
    const espacios = resumen.data.masReservados ?? []
    datosEspacios.value = {
      labels: espacios.map((e: any) => e.nombre),
      datasets: [{
        label: 'Reservas',
        data: espacios.map((e: any) => e.totalReservas),
        backgroundColor: '#42b883',
        borderRadius: 6,
      }],
    }

    // Asistencia de empleados del cliente
    const respAsistencia = await instanciaAxios.get(`/dashboard/cliente/${id}/asistencia`)
    asistencia.value = respAsistencia.data

    // Horas pico y ocupación global — solo para superadmin
    if (tieneRol('superadmin')) {

      // Franjas horarias con más reservas
      const respHoras = await instanciaAxios.get('/dashboard/horas-pico')
      const horas = respHoras.data ?? []
      datosHorasPico.value = {
        labels: horas.map((h: any) => `${h.hora}:00`),
        datasets: [{
          label: 'Reservas',
          data: horas.map((h: any) => h.cantidad),
          borderColor: '#42b883',
          backgroundColor: 'rgba(66,184,131,0.15)',
          tension: 0.4,
          fill: true,
        }],
      }

      // Ocupación global por cliente con colores diferenciados
      const respGlobal = await instanciaAxios.get('/dashboard/global')
      const global = respGlobal.data ?? []
      const colores = ['#42b883', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']
      datosOcupacion.value = {
        labels: global.map((c: any) => c.nombreCliente),
        datasets: [{
          data: global.map((c: any) => c.horasTotales),
          // Asigna colores cíclicamente si hay más clientes que colores definidos
          backgroundColor: global.map((_: any, i: number) => colores[i % colores.length]),
        }],
      }
    }
  } catch {
    error.value = 'No se pudieron cargar las estadísticas. Inténtalo de nuevo.'
  } finally {
    cargando.value = false
  }
})

/**
 * Descarga el CSV de estadísticas del cliente mediante una petición Blob.
 * Crea un enlace temporal en el DOM para forzar la descarga del archivo
 * y lo elimina tras usarlo.
 */
async function exportarCsv() {
  try {
    const id = clienteId.value ?? 1
    const respuesta = await instanciaAxios.get(
      `/dashboard/cliente/${id}/exportar`,
      { responseType: 'blob' }
    )
    // Crear URL temporal para el archivo descargado
    const url = URL.createObjectURL(new Blob([respuesta.data]))
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `estadisticas_cliente_${id}.csv`
    enlace.click()
    // Liberar la URL temporal tras la descarga
    URL.revokeObjectURL(url)
  } catch {
    alert('No se pudo exportar el CSV.')
  }
}
</script>