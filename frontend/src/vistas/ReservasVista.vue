<template>
  <div class="space-y-6">

    <!-- Cabecera con título y botón de nueva reserva -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Mis Reservas</h1>
        <p class="text-sm text-gray-400 mt-1">Gestiona tus reservas activas y pasadas</p>
      </div>
      <!-- Botón que abre el modal de creación de reserva -->
      <button
        @click="abrirModalNuevaReserva"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
      >
        <i class="pi pi-plus"></i>
        Nueva reserva
      </button>
    </div>

    <!-- Filtros por estado de reserva -->
    <div class="flex gap-2">
      <button
        v-for="filtro in filtros"
        :key="filtro.valor"
        @click="filtroActivo = filtro.valor"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150"
        :class="filtroActivo === filtro.valor
          ? 'bg-green-600 text-white'
          : 'bg-white text-gray-500 hover:bg-gray-100'"
      >
        {{ filtro.etiqueta }}
      </button>
    </div>

    <!-- Indicador de carga mientras se obtienen las reservas -->
    <div v-if="cargando" class="flex justify-center py-20">
      <i class="pi pi-spin pi-spinner text-green-500 text-3xl"></i>
    </div>

    <!-- Mensaje de error si falla la carga -->
    <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
      <p class="text-red-500 text-sm">{{ error }}</p>
    </div>

    <!-- Grid de tarjetas de reservas -->
    <div v-else class="flex flex-wrap gap-4">
      <div
        v-for="reserva in reservasFiltradas"
        :key="reserva.id"
        class="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 w-64"
      >
        <!-- Icono con color según estado y badge de estado -->
        <div class="flex items-start justify-between">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            :style="{ background: colorEstado(reserva.estado) }"
          >
            <i class="pi pi-calendar text-white text-base"></i>
          </div>
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="badgeEstado(reserva.estado)"
          >
            {{ etiquetaEstado(reserva.estado) }}
          </span>
        </div>

        <!-- Nombre del espacio y oficina asociada -->
        <div>
          <h3 class="font-semibold text-gray-800">
            {{ reserva.espacio?.nombre ?? `Espacio #${reserva.espacioId}` }}
          </h3>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ reserva.espacio?.oficina?.nombre ?? '' }}
          </p>
        </div>

        <!-- Fecha, hora de inicio y fin, y badge de recurrencia si aplica -->
        <div class="space-y-1">
          <div class="flex items-center gap-1 text-xs text-gray-500">
            <i class="pi pi-calendar"></i>
            <span>{{ formatearFecha(reserva.inicio) }}</span>
          </div>
          <div class="flex items-center gap-1 text-xs text-gray-500">
            <i class="pi pi-clock"></i>
            <span>{{ formatearHora(reserva.inicio) }} — {{ formatearHora(reserva.fin) }}</span>
          </div>
          <!-- Badge de recurrencia — solo visible si la reserva es recurrente -->
          <span
            v-if="reserva.tipoRecurrencia !== 'ninguna'"
            class="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
          >
            <i class="pi pi-refresh mr-1"></i>
            {{ etiquetaRecurrencia(reserva.tipoRecurrencia) }}
          </span>
        </div>

        <!-- Botón de cancelación — solo visible si la reserva está confirmada -->
        <button
          v-if="reserva.estado === 'confirmada'"
          @click="confirmarCancelacion(reserva)"
          class="mt-auto w-full py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <i class="pi pi-times mr-1"></i>
          Cancelar reserva
        </button>
      </div>
    </div>

    <!-- Mensaje cuando no hay reservas para el filtro seleccionado -->
    <div
      v-if="!cargando && !error && reservasFiltradas.length === 0"
      class="text-center py-20 text-gray-400"
    >
      <i class="pi pi-calendar text-4xl mb-3 block"></i>
      <p class="text-sm">No tienes reservas {{ filtroActivo !== 'todas' ? `con estado "${filtroActivo}"` : '' }}</p>
    </div>

    <!-- Modal de nueva reserva — se cierra al hacer clic fuera del contenido -->
    <div
      v-if="modalVisible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="modalVisible = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold text-gray-800">Nueva reserva</h2>

        <!-- Selector de espacio -->
        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Espacio</label>
          <select
            v-model="nuevaReserva.espacioId"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="" disabled>Selecciona un espacio</option>
            <option v-for="e in espaciosDisponibles" :key="e.id" :value="e.id">
              {{ e.nombre }} — {{ etiquetaTipo(e.tipo) }}
            </option>
          </select>
        </div>

        <!-- Selectores de fecha y hora de inicio y fin -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</label>
            <input
              v-model="nuevaReserva.inicio"
              type="datetime-local"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</label>
            <input
              v-model="nuevaReserva.fin"
              type="datetime-local"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        <!-- Selector de tipo de recurrencia -->
        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Recurrencia</label>
          <select
            v-model="nuevaReserva.tipoRecurrencia"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="ninguna">Sin recurrencia</option>
            <option value="diaria">Diaria</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>

        <!-- Campo de fin de recurrencia — solo visible si hay recurrencia activa -->
        <div v-if="nuevaReserva.tipoRecurrencia !== 'ninguna'" class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Fin de recurrencia</label>
          <input
            v-model="nuevaReserva.finRecurrencia"
            type="date"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <!-- Error del modal -->
        <div v-if="errorModal" class="bg-red-50 border border-red-100 rounded-lg p-3">
          <p class="text-red-500 text-xs">{{ errorModal }}</p>
        </div>

        <!-- Botones de cancelar y confirmar reserva -->
        <div class="flex gap-3 pt-2">
          <button
            @click="modalVisible = false"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="guardarReserva"
            :disabled="guardando"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
          >
            <i v-if="guardando" class="pi pi-spin pi-spinner mr-1"></i>
            {{ guardando ? 'Guardando...' : 'Confirmar reserva' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  type Reserva,
  obtenerMisReservas,
  crearReserva,
  cancelarReserva,
} from '../servicios/reservas'
import { obtenerEspaciosPorOficina, type Espacio } from '../servicios/espacios'

const route = useRoute()
const router = useRouter()

/** Lista reactiva de reservas del usuario autenticado */
const reservas = ref<Reserva[]>([])

/** Lista de espacios activos para el selector del modal de nueva reserva */
const espaciosDisponibles = ref<Espacio[]>([])

/** Indica si la carga inicial de datos está en curso */
const cargando = ref(true)

/** Mensaje de error general de la vista */
const error = ref('')

/** Mensaje de error dentro del modal de nueva reserva */
const errorModal = ref('')

/** Estado actualmente seleccionado en el filtro de reservas */
const filtroActivo = ref('todas')

/** Controla la visibilidad del modal de nueva reserva */
const modalVisible = ref(false)

/** Indica si hay una petición de creación de reserva en curso */
const guardando = ref(false)

/** Estado reactivo del formulario de nueva reserva */
const nuevaReserva = reactive({
  espacioId: '' as number | '',
  inicio: '',
  fin: '',
  tipoRecurrencia: 'ninguna' as 'ninguna' | 'diaria' | 'semanal' | 'mensual',
  finRecurrencia: '',
})

/** Opciones de filtro disponibles por estado de reserva */
const filtros = [
  { valor: 'todas',      etiqueta: 'Todas' },
  { valor: 'confirmada', etiqueta: 'Confirmadas' },
  { valor: 'cancelada',  etiqueta: 'Canceladas' },
]

/**
 * Lista de reservas filtrada según el estado seleccionado.
 * Si el filtro es 'todas', devuelve todas las reservas del usuario.
 */
const reservasFiltradas = computed(() => {
  if (filtroActivo.value === 'todas') return reservas.value
  return reservas.value.filter((r) => r.estado === filtroActivo.value)
})

/**
 * Carga en paralelo las reservas del usuario y los espacios disponibles al montar.
 * Si la URL contiene el parámetro `espacioId`, abre el modal con ese espacio
 * preseleccionado y limpia el parámetro de la URL tras procesarlo.
 */
onMounted(async () => {
  try {
    const [misReservas, espacios] = await Promise.all([
      obtenerMisReservas(),
      obtenerEspaciosPorOficina(1),
    ])
    reservas.value = misReservas
    espaciosDisponibles.value = espacios

    // Preseleccionar espacio si se navega desde la vista de Espacios
    const espacioIdParam = route.query.espacioId
    if (espacioIdParam) {
      nuevaReserva.espacioId = parseInt(espacioIdParam as string, 10)
      modalVisible.value = true
      // Limpiar el parámetro de la URL sin recargar la vista
      await router.replace({ name: 'reservas' })
    }
  } catch {
    error.value = 'No se pudieron cargar las reservas. Inténtalo de nuevo.'
  } finally {
    cargando.value = false
  }
})

/**
 * Abre el modal de nueva reserva limpiando todos los campos del formulario
 * y reseteando el mensaje de error del modal.
 */
function abrirModalNuevaReserva() {
  nuevaReserva.espacioId = ''
  nuevaReserva.inicio = ''
  nuevaReserva.fin = ''
  nuevaReserva.tipoRecurrencia = 'ninguna'
  nuevaReserva.finRecurrencia = ''
  errorModal.value = ''
  modalVisible.value = true
}

/**
 * Valida el formulario y envía la nueva reserva al backend.
 * Convierte las fechas a formato ISO 8601 antes de enviarlas.
 * Recarga la lista de reservas tras una creación exitosa y cierra el modal.
 */
async function guardarReserva() {
  errorModal.value = ''

  if (!nuevaReserva.espacioId || !nuevaReserva.inicio || !nuevaReserva.fin) {
    errorModal.value = 'Rellena todos los campos obligatorios'
    return
  }

  guardando.value = true
  try {
    await crearReserva({
      espacioId: nuevaReserva.espacioId as number,
      inicio: new Date(nuevaReserva.inicio).toISOString(),
      fin: new Date(nuevaReserva.fin).toISOString(),
      tipoRecurrencia: nuevaReserva.tipoRecurrencia,
      finRecurrencia: nuevaReserva.finRecurrencia
        ? new Date(nuevaReserva.finRecurrencia).toISOString()
        : undefined,
    })
    // Recargar la lista actualizada tras crear la reserva
    reservas.value = await obtenerMisReservas()
    modalVisible.value = false
  } catch {
    errorModal.value = 'No se pudo crear la reserva. El espacio puede no estar disponible.'
  } finally {
    guardando.value = false
  }
}

/**
 * Solicita confirmación al usuario antes de cancelar una reserva.
 * Recarga la lista de reservas tras una cancelación exitosa.
 * @param reserva Reserva a cancelar
 */
async function confirmarCancelacion(reserva: Reserva) {
  if (!confirm(`¿Cancelar la reserva de "${reserva.espacio?.nombre ?? 'este espacio'}"?`)) return
  try {
    await cancelarReserva(reserva.id)
    reservas.value = await obtenerMisReservas()
  } catch {
    alert('No se pudo cancelar la reserva.')
  }
}

/** Devuelve el gradiente de color del icono según el estado de la reserva */
function colorEstado(estado: string): string {
  const colores: Record<string, string> = {
    confirmada: 'linear-gradient(135deg, #2d8f6f, #42b883)',
    cancelada:  'linear-gradient(135deg, #ef4444, #f87171)',
    pendiente:  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  }
  return colores[estado] ?? 'linear-gradient(135deg, #6b7280, #9ca3af)'
}

/** Devuelve las clases CSS del badge según el estado de la reserva */
function badgeEstado(estado: string): string {
  const badges: Record<string, string> = {
    confirmada: 'bg-green-100 text-green-700',
    cancelada:  'bg-red-100 text-red-700',
    pendiente:  'bg-yellow-100 text-yellow-700',
  }
  return badges[estado] ?? 'bg-gray-100 text-gray-600'
}

/** Devuelve la etiqueta legible del estado de la reserva */
function etiquetaEstado(estado: string): string {
  const etiquetas: Record<string, string> = {
    confirmada: 'Confirmada',
    cancelada:  'Cancelada',
    pendiente:  'Pendiente',
  }
  return etiquetas[estado] ?? estado
}

/** Devuelve la etiqueta legible del tipo de recurrencia */
function etiquetaRecurrencia(tipo: string): string {
  const etiquetas: Record<string, string> = {
    diaria:  'Diaria',
    semanal: 'Semanal',
    mensual: 'Mensual',
  }
  return etiquetas[tipo] ?? tipo
}

/** Devuelve la etiqueta legible del tipo de espacio para el selector del modal */
function etiquetaTipo(tipo: string): string {
  const etiquetas: Record<string, string> = {
    puesto:      'Puesto',
    sala_juntas: 'Sala de juntas',
    cabina:      'Cabina',
    otro:        'Otro',
  }
  return etiquetas[tipo] ?? tipo
}

/**
 * Formatea una fecha ISO a formato corto legible en español.
 * Ejemplo: "lun, 5 may 2025"
 * @param fecha Fecha en formato ISO 8601
 */
function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Formatea una fecha ISO a hora en formato HH:MM.
 * Ejemplo: "09:00"
 * @param fecha Fecha en formato ISO 8601
 */
function formatearHora(fecha: string): string {
  return new Date(fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>