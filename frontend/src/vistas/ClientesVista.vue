<template>
  <div class="space-y-6">

    <!-- Cabecera -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Clientes</h1>
        <p class="text-sm text-gray-400 mt-1">Gestión de empresas y autónomos</p>
      </div>
      <button
        @click="abrirModalCrear"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
      >
        <i class="pi pi-plus"></i>
        Nuevo cliente
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

    <!-- Grid de cards de clientes -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="cliente in clientes"
        :key="cliente.id"
        class="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3"
      >
        <!-- Cabecera de la card -->
        <div class="flex items-start justify-between">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style="background: linear-gradient(135deg, #2d8f6f, #42b883)"
          >
            {{ iniciales(cliente.nombre) }}
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="abrirModalEditar(cliente)"
              class="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <i class="pi pi-pencil"></i>
            </button>
            <button
              @click="confirmarEliminacion(cliente)"
              class="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>

        <!-- Nombre -->
        <div>
          <h3 class="font-semibold text-gray-800">{{ cliente.nombre }}</h3>
          <p class="text-xs text-gray-400 mt-0.5">ID #{{ cliente.id }}</p>
        </div>

        <!-- Datos de contacto -->
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <i class="pi pi-envelope w-4"></i>
            <span>{{ cliente.correo }}</span>
          </div>
          <div v-if="cliente.telefono" class="flex items-center gap-2 text-xs text-gray-500">
            <i class="pi pi-phone w-4"></i>
            <span>{{ cliente.telefono }}</span>
          </div>
        </div>

        <!-- Número de usuarios -->
        <div class="flex items-center gap-2 text-xs text-gray-400 pt-1 border-t border-gray-50">
          <i class="pi pi-users"></i>
          <span>{{ cliente.usuarios?.length ?? 0 }} usuario{{ (cliente.usuarios?.length ?? 0) !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div
      v-if="!cargando && !error && clientes.length === 0"
      class="text-center py-20 text-gray-400"
    >
      <i class="pi pi-briefcase text-4xl mb-3 block"></i>
      <p class="text-sm">No hay clientes registrados</p>
    </div>

    <!-- Modal crear cliente -->
    <div
      v-if="modalCrearVisible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="modalCrearVisible = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold text-gray-800">Nuevo cliente</h2>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</label>
          <input
            v-model="formularioCrear.nombre"
            type="text"
            placeholder="Empresa S.L. o Nombre Apellidos"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Correo electrónico</label>
          <input
            v-model="formularioCrear.correo"
            type="email"
            placeholder="contacto@empresa.com"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</label>
          <input
            v-model="formularioCrear.telefono"
            type="text"
            placeholder="+34 922 000 000 (opcional)"
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
            @click="guardarCliente"
            :disabled="guardando"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
          >
            <i v-if="guardando" class="pi pi-spin pi-spinner mr-1"></i>
            {{ guardando ? 'Guardando...' : 'Crear cliente' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal editar cliente -->
    <div
      v-if="modalEditarVisible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="modalEditarVisible = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold text-gray-800">Editar cliente</h2>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</label>
          <input
            v-model="formularioEditar.nombre"
            type="text"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Correo electrónico</label>
          <input
            v-model="formularioEditar.correo"
            type="email"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</label>
          <input
            v-model="formularioEditar.telefono"
            type="text"
            placeholder="Opcional"
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
  type Cliente,
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from '../servicios/clientes'

/** Lista de clientes cargados desde el backend */
const clientes = ref<Cliente[]>([])

/** Estado de carga inicial */
const cargando = ref(true)

/** Mensaje de error general */
const error = ref('')

/** Controla la visibilidad del modal de creación */
const modalCrearVisible = ref(false)

/** Controla la visibilidad del modal de edición */
const modalEditarVisible = ref(false)

/** ID del cliente que se está editando */
const clienteEditandoId = ref<number | null>(null)

/** Indica si hay una petición de guardado en curso */
const guardando = ref(false)

/** Mensaje de error del modal de creación */
const errorModalCrear = ref('')

/** Mensaje de error del modal de edición */
const errorModalEditar = ref('')

/** Datos reactivos del formulario de creación */
const formularioCrear = reactive({
  nombre: '',
  correo: '',
  telefono: '',
})

/** Datos reactivos del formulario de edición */
const formularioEditar = reactive({
  nombre: '',
  correo: '',
  telefono: '',
})

/** Carga todos los clientes al montar el componente */
onMounted(async () => {
  try {
    clientes.value = await obtenerClientes()
  } catch {
    error.value = 'No se pudieron cargar los clientes. Inténtalo de nuevo.'
  } finally {
    cargando.value = false
  }
})

/** Abre el modal de creación limpiando el formulario */
function abrirModalCrear() {
  formularioCrear.nombre = ''
  formularioCrear.correo = ''
  formularioCrear.telefono = ''
  errorModalCrear.value = ''
  modalCrearVisible.value = true
}

/**
 * Abre el modal de edición precargando los datos del cliente seleccionado.
 * @param cliente Cliente a editar
 */
function abrirModalEditar(cliente: Cliente) {
  clienteEditandoId.value = cliente.id
  formularioEditar.nombre = cliente.nombre
  formularioEditar.correo = cliente.correo
  formularioEditar.telefono = cliente.telefono ?? ''
  errorModalEditar.value = ''
  modalEditarVisible.value = true
}

/**
 * Valida y envía el nuevo cliente al backend.
 * Recarga la lista tras una creación exitosa.
 */
async function guardarCliente() {
  errorModalCrear.value = ''

  if (!formularioCrear.nombre || !formularioCrear.correo) {
    errorModalCrear.value = 'Nombre y correo son obligatorios'
    return
  }

  guardando.value = true
  try {
    await crearCliente({
      nombre: formularioCrear.nombre,
      correo: formularioCrear.correo,
      telefono: formularioCrear.telefono || undefined,
    })
    clientes.value = await obtenerClientes()
    modalCrearVisible.value = false
  } catch {
    errorModalCrear.value = 'No se pudo crear el cliente. El correo puede estar ya registrado.'
  } finally {
    guardando.value = false
  }
}

/**
 * Valida y envía los cambios del cliente editado al backend.
 * Recarga la lista tras una edición exitosa.
 */
async function guardarEdicion() {
  errorModalEditar.value = ''

  if (!formularioEditar.nombre || !formularioEditar.correo) {
    errorModalEditar.value = 'Nombre y correo son obligatorios'
    return
  }

  if (!clienteEditandoId.value) return

  guardando.value = true
  try {
    await actualizarCliente(clienteEditandoId.value, {
      nombre: formularioEditar.nombre,
      correo: formularioEditar.correo,
      telefono: formularioEditar.telefono || undefined,
    })
    clientes.value = await obtenerClientes()
    modalEditarVisible.value = false
  } catch {
    errorModalEditar.value = 'No se pudo actualizar el cliente.'
  } finally {
    guardando.value = false
  }
}

/** Confirma y elimina un cliente */
async function confirmarEliminacion(cliente: Cliente) {
  if (!confirm(`¿Eliminar el cliente "${cliente.nombre}"? Se eliminarán todos sus datos asociados.`)) return
  try {
    await eliminarCliente(cliente.id)
    clientes.value = clientes.value.filter((c) => c.id !== cliente.id)
  } catch {
    alert('No se pudo eliminar el cliente.')
  }
}

/** Genera las iniciales de un nombre */
function iniciales(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('')
}
</script>