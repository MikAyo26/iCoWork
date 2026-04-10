<template>
  <div class="space-y-6">

    <!-- Cabecera -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Oficinas</h1>
        <p class="text-sm text-gray-400 mt-1">Gestión de oficinas y espacios</p>
      </div>
      <button
        @click="abrirModalCrear"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
      >
        <i class="pi pi-plus"></i>
        Nueva oficina
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

    <!-- Grid de cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="oficina in oficinas"
        :key="oficina.id"
        class="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3"
        :class="!oficina.activo ? 'opacity-60' : ''"
      >
        <!-- Cabecera -->
        <div class="flex items-start justify-between">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style="background: linear-gradient(135deg, #3b82f6, #60a5fa)"
          >
            <i class="pi pi-building text-white text-base"></i>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="oficina.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ oficina.activo ? 'Activa' : 'Inactiva' }}
            </span>
            <button
              @click="abrirModalEditar(oficina)"
              class="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <i class="pi pi-pencil"></i>
            </button>
            <button
              @click="confirmarEliminacion(oficina)"
              class="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>

        <!-- Nombre -->
        <div>
          <h3 class="font-semibold text-gray-800">{{ oficina.nombre }}</h3>
          <p class="text-xs text-gray-400 mt-0.5">ID #{{ oficina.id }}</p>
        </div>

        <!-- Dirección -->
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <i class="pi pi-map-marker w-4"></i>
            <span>{{ oficina.direccion }}</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <i class="pi pi-globe w-4"></i>
            <span>{{ oficina.ciudad }}, {{ oficina.pais }}</span>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="flex items-center justify-between pt-1 border-t border-gray-50">
          <div class="flex items-center gap-1 text-xs text-gray-400">
            <i class="pi pi-desktop"></i>
            <span>{{ oficina.totalPuestos }} puestos</span>
          </div>
          <div class="flex items-center gap-1 text-xs text-gray-400">
            <i class="pi pi-th-large"></i>
            <span>{{ oficina.espacios?.length ?? 0 }} espacios</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div
      v-if="!cargando && !error && oficinas.length === 0"
      class="text-center py-20 text-gray-400"
    >
      <i class="pi pi-building text-4xl mb-3 block"></i>
      <p class="text-sm">No hay oficinas registradas</p>
    </div>

    <!-- Modal crear oficina -->
    <div
      v-if="modalCrearVisible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="modalCrearVisible = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold text-gray-800">Nueva oficina</h2>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</label>
          <input
            v-model="formularioCrear.nombre"
            type="text"
            placeholder="Oficina Centro"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</label>
          <input
            v-model="formularioCrear.direccion"
            type="text"
            placeholder="Calle Mayor 1"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</label>
            <input
              v-model="formularioCrear.ciudad"
              type="text"
              placeholder="Santa Cruz de Tenerife"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">País</label>
            <input
              v-model="formularioCrear.pais"
              type="text"
              placeholder="España"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total de puestos</label>
          <input
            v-model.number="formularioCrear.totalPuestos"
            type="number"
            min="0"
            placeholder="0"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div v-if="errorModalCrear" class="bg-red-50 border border-red-100 rounded-lg p-3">
          <p class="text-red-500 text-xs">{{ errorModalCrear }}</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="modalCrearVisible = false"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="guardarOficina"
            :disabled="guardando"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
          >
            <i v-if="guardando" class="pi pi-spin pi-spinner mr-1"></i>
            {{ guardando ? 'Guardando...' : 'Crear oficina' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal editar oficina -->
    <div
      v-if="modalEditarVisible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="modalEditarVisible = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold text-gray-800">Editar oficina</h2>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</label>
          <input
            v-model="formularioEditar.nombre"
            type="text"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</label>
          <input
            v-model="formularioEditar.direccion"
            type="text"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</label>
            <input
              v-model="formularioEditar.ciudad"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">País</label>
            <input
              v-model="formularioEditar.pais"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total de puestos</label>
          <input
            v-model.number="formularioEditar.totalPuestos"
            type="number"
            min="0"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div v-if="errorModalEditar" class="bg-red-50 border border-red-100 rounded-lg p-3">
          <p class="text-red-500 text-xs">{{ errorModalEditar }}</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="modalEditarVisible = false"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="guardarEdicion"
            :disabled="guardando"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
          >
            <i v-if="guardando" class="pi pi-spin pi-spinner mr-1"></i>
            {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  type Oficina,
  obtenerOficinas,
  crearOficina,
  actualizarOficina,
  eliminarOficina,
} from '../servicios/oficinas'

/** Lista de oficinas cargadas desde el backend */
const oficinas = ref<Oficina[]>([])

/** Estado de carga inicial */
const cargando = ref(true)

/** Mensaje de error general */
const error = ref('')

/** Controla la visibilidad del modal de creación */
const modalCrearVisible = ref(false)

/** Controla la visibilidad del modal de edición */
const modalEditarVisible = ref(false)

/** ID de la oficina que se está editando */
const oficinaEditandoId = ref<number | null>(null)

/** Indica si hay una petición de guardado en curso */
const guardando = ref(false)

/** Mensaje de error del modal de creación */
const errorModalCrear = ref('')

/** Mensaje de error del modal de edición */
const errorModalEditar = ref('')

/** Datos reactivos del formulario de creación */
const formularioCrear = reactive({
  nombre: '',
  direccion: '',
  ciudad: '',
  pais: 'España',
  totalPuestos: 0,
})

/** Datos reactivos del formulario de edición */
const formularioEditar = reactive({
  nombre: '',
  direccion: '',
  ciudad: '',
  pais: '',
  totalPuestos: 0,
})

/** Carga todas las oficinas al montar el componente */
onMounted(async () => {
  try {
    oficinas.value = await obtenerOficinas()
  } catch {
    error.value = 'No se pudieron cargar las oficinas. Inténtalo de nuevo.'
  } finally {
    cargando.value = false
  }
})

/** Abre el modal de creación limpiando el formulario */
function abrirModalCrear() {
  formularioCrear.nombre = ''
  formularioCrear.direccion = ''
  formularioCrear.ciudad = ''
  formularioCrear.pais = 'España'
  formularioCrear.totalPuestos = 0
  errorModalCrear.value = ''
  modalCrearVisible.value = true
}

/**
 * Abre el modal de edición precargando los datos de la oficina seleccionada.
 * @param oficina Oficina a editar
 */
function abrirModalEditar(oficina: Oficina) {
  oficinaEditandoId.value = oficina.id
  formularioEditar.nombre = oficina.nombre
  formularioEditar.direccion = oficina.direccion
  formularioEditar.ciudad = oficina.ciudad
  formularioEditar.pais = oficina.pais
  formularioEditar.totalPuestos = oficina.totalPuestos
  errorModalEditar.value = ''
  modalEditarVisible.value = true
}

/**
 * Valida y envía la nueva oficina al backend.
 * Recarga la lista tras una creación exitosa.
 */
async function guardarOficina() {
  errorModalCrear.value = ''

  if (!formularioCrear.nombre || !formularioCrear.direccion || !formularioCrear.ciudad) {
    errorModalCrear.value = 'Nombre, dirección y ciudad son obligatorios'
    return
  }

  guardando.value = true
  try {
    await crearOficina({
      nombre: formularioCrear.nombre,
      direccion: formularioCrear.direccion,
      ciudad: formularioCrear.ciudad,
      pais: formularioCrear.pais || undefined,
      totalPuestos: formularioCrear.totalPuestos,
    })
    oficinas.value = await obtenerOficinas()
    modalCrearVisible.value = false
  } catch {
    errorModalCrear.value = 'No se pudo crear la oficina.'
  } finally {
    guardando.value = false
  }
}

/**
 * Valida y envía los cambios de la oficina editada al backend.
 * Recarga la lista tras una edición exitosa.
 */
async function guardarEdicion() {
  errorModalEditar.value = ''

  if (!formularioEditar.nombre || !formularioEditar.direccion || !formularioEditar.ciudad) {
    errorModalEditar.value = 'Nombre, dirección y ciudad son obligatorios'
    return
  }

  if (!oficinaEditandoId.value) return

  guardando.value = true
  try {
    await actualizarOficina(oficinaEditandoId.value, {
      nombre: formularioEditar.nombre,
      direccion: formularioEditar.direccion,
      ciudad: formularioEditar.ciudad,
      pais: formularioEditar.pais,
      totalPuestos: formularioEditar.totalPuestos,
    })
    oficinas.value = await obtenerOficinas()
    modalEditarVisible.value = false
  } catch {
    errorModalEditar.value = 'No se pudo actualizar la oficina.'
  } finally {
    guardando.value = false
  }
}

/**
 * Confirma y desactiva una oficina (soft-delete).
 * @param oficina Oficina a desactivar
 */
async function confirmarEliminacion(oficina: Oficina) {
  if (!confirm(`¿Desactivar la oficina "${oficina.nombre}"?`)) return
  try {
    await eliminarOficina(oficina.id)
    oficinas.value = await obtenerOficinas()
  } catch {
    alert('No se pudo desactivar la oficina.')
  }
}
</script>