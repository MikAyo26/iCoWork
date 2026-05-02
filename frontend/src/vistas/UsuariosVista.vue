<template>
  <div class="space-y-6">

    <!-- Cabecera -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Usuarios</h1>
        <p class="text-sm text-gray-400 mt-1">Gestión de usuarios del sistema</p>
      </div>
      <button
        v-if="tieneRol('superadmin')"
        @click="abrirModalCrear"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
      >
        <i class="pi pi-plus"></i>
        Nuevo usuario
      </button>
    </div>

    <!-- Filtros por rol y por cliente — solo superadmin -->
    <div v-if="tieneRol('superadmin')" class="flex gap-2 flex-wrap">
      <button
        v-for="filtro in filtrosRol"
        :key="filtro.valor"
        @click="filtroRolActivo = filtro.valor"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150"
        :class="filtroRolActivo === filtro.valor
          ? 'bg-green-600 text-white'
          : 'bg-white text-gray-500 hover:bg-gray-100'"
      >
        {{ filtro.etiqueta }}
      </button>
      <div class="w-px bg-gray-200 mx-1"></div>
      <select
        v-model="filtroClienteActivo"
        class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
      >
        <option value="">Todos los clientes</option>
        <option
          v-for="cliente in clientesUnicos"
          :key="cliente.id"
          :value="cliente.id"
        >
          {{ cliente.nombre }}
        </option>
      </select>
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="flex justify-center py-20">
      <i class="pi pi-spin pi-spinner text-green-500 text-3xl"></i>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
      <p class="text-red-500 text-sm">{{ error }}</p>
    </div>

    <!-- Tabla de usuarios -->
    <div v-else class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="usuario in usuariosFiltrados" :key="usuario.id" class="hover:bg-gray-50 transition-colors">

            <!-- Nombre e iniciales -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style="background: linear-gradient(135deg, #2d8f6f, #42b883)"
                >
                  {{ iniciales(usuario.nombre) }}
                </div>
                <div>
                  <p class="font-medium text-gray-800">{{ usuario.nombre }}</p>
                  <p v-if="usuario.departamento" class="text-xs text-gray-400">{{ usuario.departamento }}</p>
                </div>
              </div>
            </td>

            <!-- Correo -->
            <td class="px-6 py-4 text-gray-500">{{ usuario.correo }}</td>

            <!-- Rol -->
            <td class="px-6 py-4">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="badgeRol(usuario.rol)">
                {{ etiquetaRol(usuario.rol) }}
              </span>
            </td>

            <!-- Cliente -->
            <td class="px-6 py-4 text-gray-500 text-xs">
              {{ usuario.cliente?.nombre ?? '—' }}
            </td>

            <!-- Estado -->
            <td class="px-6 py-4">
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="usuario.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ usuario.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <!-- Acciones -->
            <td class="px-6 py-4 text-right">
              <!-- Superadmin: puede editar y eliminar -->
              <template v-if="tieneRol('superadmin')">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="abrirModalEditar(usuario)"
                    class="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button
                    @click="confirmarEliminacion(usuario)"
                    class="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </template>

              <!-- Admin: muestra badge de soporte para superadmins -->
              <template v-else-if="usuario.rol === 'superadmin'">
                <span class="text-xs text-green-600 font-medium">
                  <i class="pi pi-headphones mr-1"></i>
                  Soporte
                </span>
              </template>
            </td>

          </tr>
        </tbody>
      </table>

      <!-- Sin resultados con filtros -->
      <div
        v-if="usuariosFiltrados.length === 0"
        class="text-center py-12 text-gray-400"
      >
        <i class="pi pi-users text-3xl mb-2 block"></i>
        <p class="text-sm">No hay usuarios con los filtros seleccionados</p>
      </div>
    </div>

    <!-- Modal crear usuario — solo superadmin -->
    <div
      v-if="modalCrearVisible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="modalCrearVisible = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold text-gray-800">Nuevo usuario</h2>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre completo</label>
          <input
            v-model="formularioCrear.nombre"
            type="text"
            placeholder="Juan García López"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Correo electrónico</label>
          <input
            v-model="formularioCrear.correo"
            type="email"
            placeholder="juan@empresa.com"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Contraseña</label>
          <input
            v-model="formularioCrear.contrasena"
            type="password"
            placeholder="Mínimo 8 caracteres"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</label>
          <input
            v-model="formularioCrear.departamento"
            type="text"
            placeholder="Desarrollo, Marketing... (opcional)"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</label>
            <select
              v-model="formularioCrear.rol"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="empleado">Empleado</option>
              <option value="admin">Administrador</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente ID</label>
            <input
              v-model.number="formularioCrear.clienteId"
              type="number"
              placeholder="Opcional"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
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
            @click="guardarUsuario"
            :disabled="guardando"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
          >
            <i v-if="guardando" class="pi pi-spin pi-spinner mr-1"></i>
            {{ guardando ? 'Guardando...' : 'Crear usuario' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal editar usuario — solo superadmin -->
    <div
      v-if="modalEditarVisible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="modalEditarVisible = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold text-gray-800">Editar usuario</h2>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre completo</label>
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
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nueva contraseña</label>
          <input
            v-model="formularioEditar.contrasena"
            type="password"
            placeholder="Dejar vacío para no cambiar"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</label>
          <input
            v-model="formularioEditar.departamento"
            type="text"
            placeholder="Opcional"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</label>
            <select
              v-model="formularioEditar.rol"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="empleado">Empleado</option>
              <option value="admin">Administrador</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente ID</label>
            <input
              v-model.number="formularioEditar.clienteId"
              type="number"
              placeholder="Opcional"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
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
import { computed, onMounted, reactive, ref } from 'vue'
import {
  type Usuario,
  obtenerUsuarios,
  eliminarUsuario,
  crearUsuario,
  actualizarUsuario,
} from '../servicios/usuarios'
import { useUsuarioActual } from '../composiciones/useUsuarioActual'

const { tieneRol } = useUsuarioActual()

/** Lista completa de usuarios cargados desde el backend */
const usuarios = ref<Usuario[]>([])

/** Estado de carga inicial */
const cargando = ref(true)

/** Mensaje de error general */
const error = ref('')

/** Filtro activo por rol */
const filtroRolActivo = ref('todos')

/** Filtro activo por cliente (ID o cadena vacía para todos) */
const filtroClienteActivo = ref<number | ''>('')

/** Opciones de filtro por rol */
const filtrosRol = [
  { valor: 'todos',      etiqueta: 'Todos' },
  { valor: 'superadmin', etiqueta: 'Superadmin' },
  { valor: 'admin',      etiqueta: 'Administrador' },
  { valor: 'empleado',   etiqueta: 'Empleado' },
]

/**
 * Lista de clientes únicos extraída de los usuarios cargados.
 * Se usa para poblar el selector de filtro por cliente.
 */
const clientesUnicos = computed(() => {
  const mapa = new Map<number, { id: number; nombre: string }>()
  usuarios.value.forEach((u) => {
    if (u.cliente) mapa.set(u.cliente.id, u.cliente)
  })
  return Array.from(mapa.values())
})

/** Usuarios filtrados según rol y cliente seleccionados */
const usuariosFiltrados = computed(() => {
  return usuarios.value.filter((u) => {
    const pasaRol = filtroRolActivo.value === 'todos' || u.rol === filtroRolActivo.value
    const pasaCliente = filtroClienteActivo.value === '' || u.clienteId === filtroClienteActivo.value
    return pasaRol && pasaCliente
  })
})

/** Controla la visibilidad del modal de creación */
const modalCrearVisible = ref(false)

/** Controla la visibilidad del modal de edición */
const modalEditarVisible = ref(false)

/** ID del usuario que se está editando */
const usuarioEditandoId = ref<number | null>(null)

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
  contrasena: '',
  departamento: '',
  rol: 'empleado' as 'superadmin' | 'admin' | 'empleado',
  clienteId: undefined as number | undefined,
})

/** Datos reactivos del formulario de edición */
const formularioEditar = reactive({
  nombre: '',
  correo: '',
  contrasena: '',
  departamento: '',
  rol: 'empleado' as 'superadmin' | 'admin' | 'empleado',
  clienteId: undefined as number | undefined,
})

/** Carga todos los usuarios al montar el componente */
onMounted(async () => {
  try {
    usuarios.value = await obtenerUsuarios()
  } catch {
    error.value = 'No se pudieron cargar los usuarios. Inténtalo de nuevo.'
  } finally {
    cargando.value = false
  }
})

/** Abre el modal de creación limpiando el formulario */
function abrirModalCrear() {
  formularioCrear.nombre = ''
  formularioCrear.correo = ''
  formularioCrear.contrasena = ''
  formularioCrear.departamento = ''
  formularioCrear.rol = 'empleado'
  formularioCrear.clienteId = undefined
  errorModalCrear.value = ''
  modalCrearVisible.value = true
}

/**
 * Abre el modal de edición precargando los datos del usuario seleccionado.
 * @param usuario Usuario a editar
 */
function abrirModalEditar(usuario: Usuario) {
  usuarioEditandoId.value = usuario.id
  formularioEditar.nombre = usuario.nombre
  formularioEditar.correo = usuario.correo
  formularioEditar.contrasena = ''
  formularioEditar.departamento = usuario.departamento ?? ''
  formularioEditar.rol = usuario.rol
  formularioEditar.clienteId = usuario.clienteId ?? undefined
  errorModalEditar.value = ''
  modalEditarVisible.value = true
}

/**
 * Valida y envía el nuevo usuario al backend.
 * Recarga la lista tras una creación exitosa.
 */
async function guardarUsuario() {
  errorModalCrear.value = ''

  if (!formularioCrear.nombre || !formularioCrear.correo || !formularioCrear.contrasena) {
    errorModalCrear.value = 'Nombre, correo y contraseña son obligatorios'
    return
  }

  if (formularioCrear.contrasena.length < 8) {
    errorModalCrear.value = 'La contraseña debe tener mínimo 8 caracteres'
    return
  }

  guardando.value = true
  try {
    await crearUsuario({
      nombre: formularioCrear.nombre,
      correo: formularioCrear.correo,
      contrasena: formularioCrear.contrasena,
      departamento: formularioCrear.departamento || undefined,
      rol: formularioCrear.rol,
      clienteId: formularioCrear.clienteId,
    })
    usuarios.value = await obtenerUsuarios()
    modalCrearVisible.value = false
  } catch {
    errorModalCrear.value = 'No se pudo crear el usuario. El correo puede estar ya registrado.'
  } finally {
    guardando.value = false
  }
}

/**
 * Valida y envía los cambios del usuario editado al backend.
 * Recarga la lista tras una edición exitosa.
 */
async function guardarEdicion() {
  errorModalEditar.value = ''

  if (!formularioEditar.nombre || !formularioEditar.correo) {
    errorModalEditar.value = 'Nombre y correo son obligatorios'
    return
  }

  if (formularioEditar.contrasena && formularioEditar.contrasena.length < 8) {
    errorModalEditar.value = 'La contraseña debe tener mínimo 8 caracteres'
    return
  }

  if (!usuarioEditandoId.value) return

  guardando.value = true
  try {
    await actualizarUsuario(usuarioEditandoId.value, {
      nombre: formularioEditar.nombre,
      correo: formularioEditar.correo,
      contrasena: formularioEditar.contrasena || undefined,
      departamento: formularioEditar.departamento || undefined,
      rol: formularioEditar.rol,
      clienteId: formularioEditar.clienteId,
    })
    usuarios.value = await obtenerUsuarios()
    modalEditarVisible.value = false
  } catch {
    errorModalEditar.value = 'No se pudo actualizar el usuario.'
  } finally {
    guardando.value = false
  }
}

/** Genera las iniciales de un nombre */
function iniciales(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('')
}

/** Devuelve las clases del badge según el rol */
function badgeRol(rol: string): string {
  const badges: Record<string, string> = {
    superadmin: 'bg-purple-100 text-purple-700',
    admin:      'bg-blue-100 text-blue-700',
    empleado:   'bg-gray-100 text-gray-600',
  }
  return badges[rol] ?? 'bg-gray-100 text-gray-600'
}

/** Devuelve la etiqueta legible del rol */
function etiquetaRol(rol: string): string {
  const etiquetas: Record<string, string> = {
    superadmin: 'Superadmin',
    admin:      'Administrador',
    empleado:   'Empleado',
  }
  return etiquetas[rol] ?? rol
}

/** Confirma y elimina un usuario — solo superadmin */
async function confirmarEliminacion(usuario: Usuario) {
  if (!confirm(`¿Eliminar el usuario "${usuario.nombre}"? Esta acción no se puede deshacer.`)) return
  try {
    await eliminarUsuario(usuario.id)
    usuarios.value = usuarios.value.filter((u) => u.id !== usuario.id)
  } catch {
    alert('No se pudo eliminar el usuario.')
  }
}
</script>