<template>
  <div class="space-y-6">

    <!-- Cabecera con título y filtros por tipo de espacio -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Espacios</h1>
        <p class="text-sm text-gray-400 mt-1">Oficina Rambla Añaza — Santa Cruz de Tenerife</p>
      </div>

      <!-- Botones de filtro por tipo — resalta el filtro activo en verde -->
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
    </div>

    <!-- Indicador de carga mientras se obtienen los espacios -->
    <div v-if="cargando" class="flex justify-center py-20">
      <i class="pi pi-spin pi-spinner text-green-500 text-3xl"></i>
    </div>

    <!-- Mensaje de error si falla la petición al backend -->
    <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
      <p class="text-red-500 text-sm">{{ error }}</p>
    </div>

    <!-- Grid responsive de tarjetas de espacio -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="espacio in espaciosFiltrados"
        :key="espacio.id"
        class="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-150"
      >
        <!-- Cabecera de la tarjeta con icono y badge de tipo -->
        <div class="flex items-start justify-between">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :style="{ background: colorTipo(espacio.tipo) }"
          >
            <i :class="iconoTipo(espacio.tipo)" class="text-white text-base"></i>
          </div>
          <!-- Badge de tipo con color diferenciado por categoría -->
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="badgeTipo(espacio.tipo)"
          >
            {{ etiquetaTipo(espacio.tipo) }}
          </span>
        </div>

        <!-- Nombre y descripción del espacio -->
        <div>
          <h3 class="font-semibold text-gray-800">{{ espacio.nombre }}</h3>
          <p v-if="espacio.descripcion" class="text-xs text-gray-400 mt-0.5 line-clamp-2">
            {{ espacio.descripcion }}
          </p>
        </div>

        <!-- Capacidad máxima del espacio -->
        <div class="flex items-center gap-1 text-xs text-gray-400">
          <i class="pi pi-users"></i>
          <span>Capacidad: {{ espacio.capacidad }} persona{{ espacio.capacidad > 1 ? 's' : '' }}</span>
        </div>

        <!-- Botón de reserva — redirige a ReservasVista con el espacio preseleccionado -->
        <button
          class="mt-auto w-full py-2 rounded-lg text-sm font-medium transition-colors duration-150"
          style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%); color: white;"
          @click="reservar(espacio)"
        >
          <i class="pi pi-calendar-plus mr-1"></i>
          Reservar
        </button>
      </div>
    </div>

    <!-- Mensaje cuando no hay espacios para el filtro seleccionado -->
    <div
      v-if="!cargando && !error && espaciosFiltrados.length === 0"
      class="text-center py-20 text-gray-400"
    >
      <i class="pi pi-inbox text-4xl mb-3 block"></i>
      <p class="text-sm">No hay espacios disponibles para este filtro</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { type Espacio, obtenerEspaciosPorOficina } from '../servicios/espacios'
import { useRouter } from 'vue-router'
import { useSocket } from '../composiciones/useSocket'

/** Lista reactiva de espacios cargados desde el backend */
const espacios = ref<Espacio[]>([])

/** Indica si la petición de espacios está en curso */
const cargando = ref(true)

/** Mensaje de error si falla la carga de espacios */
const error = ref('')

/** Tipo de espacio actualmente seleccionado en el filtro */
const filtroActivo = ref('todos')

const router = useRouter()

// Métodos del composable WebSocket para suscripción y escucha de eventos
const { suscribirEspacio, alCambiarDisponibilidad, quitarListener } = useSocket()

/** Opciones de filtro disponibles por tipo de espacio */
const filtros = [
  { valor: 'todos',       etiqueta: 'Todos' },
  { valor: 'puesto',      etiqueta: 'Puestos' },
  { valor: 'sala_juntas', etiqueta: 'Salas' },
  { valor: 'cabina',      etiqueta: 'Cabinas' },
]

/**
 * Lista de espacios filtrada según el tipo seleccionado.
 * Si el filtro es 'todos', devuelve todos los espacios cargados.
 */
const espaciosFiltrados = computed(() => {
  if (filtroActivo.value === 'todos') return espacios.value
  return espacios.value.filter((e) => e.tipo === filtroActivo.value)
})

/**
 * Devuelve el gradiente de color correspondiente al tipo de espacio.
 * Se aplica al icono de la tarjeta.
 * @param tipo Tipo del espacio
 */
function colorTipo(tipo: string): string {
  const colores: Record<string, string> = {
    puesto:      'linear-gradient(135deg, #2d8f6f, #42b883)',
    sala_juntas: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
    cabina:      'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    otro:        'linear-gradient(135deg, #6b7280, #9ca3af)',
  }
  return colores[tipo] ?? 'linear-gradient(135deg, #6b7280, #9ca3af)'
}

/**
 * Devuelve la clase de icono PrimeIcons correspondiente al tipo de espacio.
 * @param tipo Tipo del espacio
 */
function iconoTipo(tipo: string): string {
  const iconos: Record<string, string> = {
    puesto:      'pi pi-desktop',
    sala_juntas: 'pi pi-users',
    cabina:      'pi pi-phone',
    otro:        'pi pi-building',
  }
  return iconos[tipo] ?? 'pi pi-building'
}

/**
 * Devuelve las clases CSS del badge según el tipo de espacio.
 * @param tipo Tipo del espacio
 */
function badgeTipo(tipo: string): string {
  const badges: Record<string, string> = {
    puesto:      'bg-green-100 text-green-700',
    sala_juntas: 'bg-blue-100 text-blue-700',
    cabina:      'bg-purple-100 text-purple-700',
    otro:        'bg-gray-100 text-gray-600',
  }
  return badges[tipo] ?? 'bg-gray-100 text-gray-600'
}

/**
 * Devuelve la etiqueta legible del tipo de espacio para mostrar en el badge.
 * @param tipo Tipo del espacio
 */
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
 * Redirige a la vista de reservas con el espacio preseleccionado como query param.
 * @param espacio Espacio seleccionado por el usuario
 */
function reservar(espacio: Espacio) {
  router.push({ name: 'reservas', query: { espacioId: espacio.id.toString() } })
}

/**
 * Manejador del evento WebSocket 'disponibilidad:cambio'.
 * Actualiza el estado activo del espacio correspondiente en la lista reactiva
 * sin necesidad de recargar la página.
 * @param datos Objeto con el ID del espacio y su nueva disponibilidad
 */
function alCambioDisponibilidad(datos: { espacioId: number; disponible: boolean }) {
  const espacio = espacios.value.find((e) => e.id === datos.espacioId)
  if (espacio) {
    espacio.activo = datos.disponible
  }
}

/**
 * Al montar el componente, carga los espacios de la oficina principal,
 * suscribe al canal WebSocket de cada espacio cargado
 * y registra el listener de cambios de disponibilidad.
 */
onMounted(async () => {
  try {
    espacios.value = await obtenerEspaciosPorOficina(1)
    // Suscribe a actualizaciones en tiempo real de cada espacio cargado
    espacios.value.forEach((e) => suscribirEspacio(e.id))
    alCambiarDisponibilidad(alCambioDisponibilidad)
  } catch {
    error.value = 'No se pudieron cargar los espacios. Inténtalo de nuevo.'
  } finally {
    cargando.value = false
  }
})

/**
 * Al desmontar el componente, elimina el listener WebSocket
 * para evitar memory leaks y eventos duplicados.
 */
onUnmounted(() => {
  quitarListener('disponibilidad:cambio', alCambioDisponibilidad)
})
</script>