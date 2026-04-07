<template>
  <div class="space-y-6">

    <!-- Cabecera -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Mis Reservas</h1>
        <p class="text-sm text-gray-400 mt-1">Gestiona tus reservas activas y pasadas</p>
        </div>
        <button
        @click="abrirModalNuevaReserva"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
        >
        <i class="pi pi-plus"></i>
        Nueva reserva
        </button>
    </div>

    <!-- Filtros por estado -->
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

    <!-- Estado de carga -->
    <div v-if="cargando" class="flex justify-center py-20">
        <i class="pi pi-spin pi-spinner text-green-500 text-3xl"></i>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
        <p class="text-red-500 text-sm">{{ error }}</p>
    </div>

    <!-- Lista de reservas -->
    <div v-else class="space-y-3">
        <div
            v-for="reserva in reservasFiltradas"
            :key="reserva.id"
            class="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between gap-4"
        >
        <!-- Info del espacio -->
        <div class="flex items-center gap-4">
            <div
            class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            :style="{ background: colorEstado(reserva.estado) }"
            >
            <i class="pi pi-calendar text-white text-base"></i>
            </div>
            <div>
            <h3 class="font-semibold text-gray-800">
                {{ reserva.espacio?.nombre ?? `Espacio #${reserva.espacioId}` }}
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ reserva.espacio?.oficina?.nombre ?? '' }}
            </p>
            <div class="flex items-center gap-3 mt-1">
              <span class="text-xs text-gray-500">
                <i class="pi pi-calendar mr-1"></i>
                {{ formatearFecha(reserva.inicio) }}
              </span>
              <span class="text-xs text-gray-500">
                <i class="pi pi-clock mr-1"></i>
                {{ formatearHora(reserva.inicio) }} — {{ formatearHora(reserva.fin) }}
              </span>
              <span
                v-if="reserva.tipoRecurrencia !== 'ninguna'"
                class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
              >
                <i class="pi pi-refresh mr-1"></i>
                {{ etiquetaRecurrencia(reserva.tipoRecurrencia) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Estado y acciones -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="badgeEstado(reserva.estado)"
          >
            {{ etiquetaEstado(reserva.estado) }}
          </span>
          <button
            v-if="reserva.estado === 'confirmada'"
            @click="confirmarCancelacion(reserva)"
            class="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
          >
            <i class="pi pi-times mr-1"></i>
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div
      v-if="!cargando && !error && reservasFiltradas.length === 0"
      class="text-center py-20 text-gray-400"
    >
      <i class="pi pi-calendar text-4xl mb-3 block"></i>
      <p class="text-sm">No tienes reservas {{ filtroActivo !== 'todas' ? `con estado "${filtroActivo}"` : '' }}</p>
    </div>

    <!-- Modal nueva reserva -->
    <div
      v-if="modalVisible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="modalVisible = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold text-gray-800">Nueva reserva</h2>

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

        <div v-if="nuevaReserva.tipoRecurrencia !== 'ninguna'" class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Fin de recurrencia</label>
          <input
            v-model="nuevaReserva.finRecurrencia"
            type="date"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div v-if="errorModal" class="bg-red-50 border border-red-100 rounded-lg p-3">
          <p class="text-red-500 text-xs">{{ errorModal }}</p>
        </div>

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
import {
  type Reserva,
  obtenerMisReservas,
  crearReserva,
  cancelarReserva,
} from '../servicios/reservas'
import { obtenerEspaciosPorOficina, type Espacio } from '../servicios/espacios'

/** Lista de reservas del usuario */
const reservas = ref<Reserva[]>([])

/** Lista de espacios para el selector del modal */
const espaciosDisponibles = ref<Espacio[]>([])

/** Estado de carga */
const cargando = ref(true)

/** Mensaje de error general */
const error = ref('')

/** Mensaje de error del modal */
const errorModal = ref('')

/** Filtro activo por estado */
const filtroActivo = ref('todas')

/** Visibilidad del modal de nueva reserva */
const modalVisible = ref(false)

/** Indica si se está guardando una reserva */
const guardando = ref(false)

/** Datos del formulario de nueva reserva */
const nuevaReserva = reactive({
    espacioId: '' as number | '',
    inicio: '',
    fin: '',
    tipoRecurrencia: 'ninguna' as 'ninguna' | 'diaria' | 'semanal' | 'mensual',
    finRecurrencia: '',
})

/** Opciones de filtro por estado */
const filtros = [
    { valor: 'todas',      etiqueta: 'Todas' },
    { valor: 'confirmada', etiqueta: 'Confirmadas' },
    { valor: 'cancelada',  etiqueta: 'Canceladas' },
]

/** Reservas filtradas según el estado seleccionado */
const reservasFiltradas = computed(() => {
    if (filtroActivo.value === 'todas') return reservas.value
    return reservas.value.filter((r) => r.estado === filtroActivo.value)
})

/** Carga las reservas y espacios al montar el componente */
onMounted(async () => {
    try {
    const [misReservas, espacios] = await Promise.all([
        obtenerMisReservas(),
        obtenerEspaciosPorOficina(1),
    ])
    reservas.value = misReservas
    espaciosDisponibles.value = espacios
    } catch {
    error.value = 'No se pudieron cargar las reservas. Inténtalo de nuevo.'
    } finally {
    cargando.value = false
    }
})

/** Abre el modal de nueva reserva y limpia el formulario */
function abrirModalNuevaReserva() {
    nuevaReserva.espacioId = ''
    nuevaReserva.inicio = ''
    nuevaReserva.fin = ''
    nuevaReserva.tipoRecurrencia = 'ninguna'
    nuevaReserva.finRecurrencia = ''
    errorModal.value = ''
    modalVisible.value = true
}

/** Guarda la nueva reserva en el backend */
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
    reservas.value = await obtenerMisReservas()
    modalVisible.value = false
    } catch {
    errorModal.value = 'No se pudo crear la reserva. El espacio puede no estar disponible.'
    } finally {
    guardando.value = false
    }
}

/** Confirma y ejecuta la cancelación de una reserva */
async function confirmarCancelacion(reserva: Reserva) {
    if (!confirm(`¿Cancelar la reserva de "${reserva.espacio?.nombre ?? 'este espacio'}"?`)) return
    try {
    await cancelarReserva(reserva.id)
    reservas.value = await obtenerMisReservas()
    } catch {
    alert('No se pudo cancelar la reserva.')
    }
}

/** Devuelve el color de fondo según el estado de la reserva */
function colorEstado(estado: string): string {
    const colores: Record<string, string> = {
        confirmada: 'linear-gradient(135deg, #2d8f6f, #42b883)',
        cancelada:  'linear-gradient(135deg, #ef4444, #f87171)',
        pendiente:  'linear-gradient(135deg, #f59e0b, #fbbf24)',
    }
    return colores[estado] ?? 'linear-gradient(135deg, #6b7280, #9ca3af)'
}

/** Devuelve las clases del badge según el estado */
function badgeEstado(estado: string): string {
    const badges: Record<string, string> = {
        confirmada: 'bg-green-100 text-green-700',
        cancelada:  'bg-red-100 text-red-700',
        pendiente:  'bg-yellow-100 text-yellow-700',
    }
    return badges[estado] ?? 'bg-gray-100 text-gray-600'
}

/** Devuelve la etiqueta legible del estado */
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
        diaria:   'Diaria',
        semanal:  'Semanal',
        mensual:  'Mensual',
    }
    return etiquetas[tipo] ?? tipo
}

/** Devuelve la etiqueta legible del tipo de espacio */
function etiquetaTipo(tipo: string): string {
    const etiquetas: Record<string, string> = {
        puesto:      'Puesto',
        sala_juntas: 'Sala de juntas',
        cabina:      'Cabina',
        otro:        'Otro',
    }
    return etiquetas[tipo] ?? tipo
}

/** Formatea una fecha ISO a formato legible en español */
function formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

/** Formatea una fecha ISO a hora legible */
function formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    })
}
</script>