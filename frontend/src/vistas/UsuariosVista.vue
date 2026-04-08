<template>
  <div class="space-y-6">

    <!-- Cabecera -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Usuarios</h1>
        <p class="text-sm text-gray-400 mt-1">Gestión de usuarios del sistema</p>
      </div>
      <!-- TODO: añadir botón para crear nuevo usuario con modal -->
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="flex justify-center py-20">
      <i class="pi pi-spin pi-spinner text-green-500 text-3xl"></i>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
      <p class="text-red-500 text-sm">{{ error }}</p>
    </div>

    <!-- TODO: añadir filtros por rol y por cliente -->

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
          <tr v-for="usuario in usuarios" :key="usuario.id" class="hover:bg-gray-50 transition-colors">

            <!-- Nombre e iniciales -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
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
              <!-- TODO: añadir botón editar usuario -->
              <button
                @click="confirmarEliminacion(usuario)"
                class="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                <i class="pi pi-trash"></i>
              </button>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { type Usuario, obtenerUsuarios, eliminarUsuario } from '../servicios/usuarios'

/** Lista de usuarios cargados desde el backend */
const usuarios = ref<Usuario[]>([])

/** Estado de carga inicial */
const cargando = ref(true)

/** Mensaje de error general */
const error = ref('')

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

/** Confirma y elimina un usuario */
async function confirmarEliminacion(usuario: Usuario) {
  if (!confirm(`¿Eliminar el usuario "${usuario.nombre}"? Esta acción no se puede deshacer.`)) return
  try {
    await eliminarUsuario(usuario.id)
    usuarios.value = usuarios.value.filter((u) => u.id !== usuario.id)
  } catch {
    alert('No se pudo eliminar el usuario.')
  }
}

// TODO: implementar modal de creación de usuario
// TODO: implementar modal de edición de usuario
// TODO: añadir filtros por rol y por cliente
</script>