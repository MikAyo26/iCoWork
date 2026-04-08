<template>
  <div class="space-y-6 max-w-2xl">

    <!-- Cabecera -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Mi Perfil</h1>
      <p class="text-sm text-gray-400 mt-1">Información de tu cuenta</p>
    </div>

    <!-- Tarjeta de perfil -->
    <div class="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center gap-4">

      <!-- Avatar grande -->
      <div
        class="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
        style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
      >
        {{ iniciales }}
      </div>

      <!-- Nombre y rol -->
      <div class="text-center">
        <h2 class="text-xl font-bold text-gray-800">{{ usuario?.nombre }}</h2>
        <span
          class="text-xs px-3 py-1 rounded-full font-medium mt-1 inline-block"
          :class="badgeRol"
        >
          {{ etiquetaRol }}
        </span>
      </div>

    </div>

    <!-- Datos de la cuenta -->
    <div class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Datos de la cuenta
      </h3>

      <div class="divide-y divide-gray-50">

        <div class="flex items-center justify-between py-3">
          <div class="flex items-center gap-3 text-gray-500">
            <i class="pi pi-user text-base w-5 text-center"></i>
            <span class="text-sm">Nombre</span>
          </div>
          <span class="text-sm font-medium text-gray-800">{{ usuario?.nombre }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <div class="flex items-center gap-3 text-gray-500">
            <i class="pi pi-envelope text-base w-5 text-center"></i>
            <span class="text-sm">Correo</span>
          </div>
          <span class="text-sm font-medium text-gray-800">{{ usuario?.correo }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <div class="flex items-center gap-3 text-gray-500">
            <i class="pi pi-shield text-base w-5 text-center"></i>
            <span class="text-sm">Rol</span>
          </div>
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="badgeRol"
          >
            {{ etiquetaRol }}
          </span>
        </div>

        <div v-if="usuario?.clienteId" class="flex items-center justify-between py-3">
          <div class="flex items-center gap-3 text-gray-500">
            <i class="pi pi-briefcase text-base w-5 text-center"></i>
            <span class="text-sm">Cliente ID</span>
          </div>
          <span class="text-sm font-medium text-gray-800">#{{ usuario.clienteId }}</span>
        </div>

      </div>
    </div>

    <!-- Sesión -->
    <div class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Sesión
      </h3>
      <button
        @click="salir"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors w-full"
      >
        <i class="pi pi-sign-out text-base"></i>
        Cerrar sesión
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuarioActual } from '../composiciones/useUsuarioActual'
import { cerrarSesion } from '../servicios/autenticacion'

const router = useRouter()
const { usuario, iniciales, rol } = useUsuarioActual()

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
    admin:      'Administrador',
    empleado:   'Empleado',
  }
  return etiquetas[rol.value] ?? rol.value
})

/** Cierra la sesión y redirige al login */
function salir() {
  cerrarSesion()
  router.push('/login')
}
</script>