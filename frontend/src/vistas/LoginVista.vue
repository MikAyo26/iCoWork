<template>
  <div class="min-h-screen flex">

    <!-- Columna izquierda — branding -->
    <div class="hidden lg:flex w-1/2 bg-gray-900 flex-col justify-between p-12">
      <div>
        <h1 class="text-white text-3xl font-bold tracking-tight">iCoWork</h1>
        <p class="text-gray-400 text-sm mt-1">Plataforma de gestión de espacios</p>
      </div>
      <div class="space-y-4">
        <h2 class="text-white text-4xl font-bold leading-tight">
          Gestiona tu espacio de trabajo de forma inteligente.
        </h2>
        <p class="text-gray-400 text-base leading-relaxed">
          Reserva puestos, salas de juntas y espacios en tiempo real.
          Todo desde un solo lugar.
        </p>
      </div>
      <p class="text-gray-600 text-xs">© 2026 iCoWork. Todos los derechos reservados.</p>
    </div>

    <!-- Columna derecha — formulario -->
    <div class="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
      <div class="w-full max-w-md space-y-8">

        <!-- Cabecera -->
        <div class="space-y-1">
          <h2 class="text-2xl font-bold text-gray-900">Bienvenido de nuevo</h2>
          <p class="text-gray-500 text-sm">Introduce tus credenciales para acceder</p>
        </div>

        <!-- Formulario -->
        <form class="space-y-5" @submit.prevent="iniciarSesion">

          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-700">Correo electrónico</label>
            <InputText
              v-model="formulario.correo"
              type="email"
              placeholder="tu@correo.com"
              class="w-full"
              :invalid="!!errores.correo"
            />
            <small v-if="errores.correo" class="text-red-500 text-xs">{{ errores.correo }}</small>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-700">Contraseña</label>
            <Password
              v-model="formulario.contrasena"
              placeholder="••••••••"
              class="w-full"
              input-class="w-full"
              :feedback="false"
              toggle-mask
              :invalid="!!errores.contrasena"
            />
            <small v-if="errores.contrasena" class="text-red-500 text-xs">{{ errores.contrasena }}</small>
          </div>

          <div v-if="errores.general" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ errores.general }}</p>
          </div>

          <Button
            type="submit"
            label="Iniciar sesión"
            icon="pi pi-sign-in"
            class="w-full"
            :loading="cargando"
          />

        </form>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const router = useRouter()

/** Estado del formulario de login */
const formulario = reactive({
    correo: '',
    contrasena: '',
})

/** Mensajes de error por campo */
const errores = reactive({
    correo: '',
    contrasena: '',
    general: '',
})

/** Indica si la petición está en curso */
const cargando = ref(false)

/** Valida los campos del formulario antes de enviar */
function validar(): boolean {
    errores.correo = ''
    errores.contrasena = ''
    errores.general = ''

    let valido = true

    if (!formulario.correo) {
    errores.correo = 'El correo es obligatorio'
    valido = false
} 

    if (!formulario.contrasena) {
    errores.contrasena = 'La contraseña es obligatoria'
    valido = false
}

    return valido
}

/** Envía las credenciales al backend y redirige si son correctas */
async function iniciarSesion() {
    if (!validar()) return

    cargando.value = true

    try {
    // TODO: conectar con el endpoint POST /api/auth/login
    console.log('Credenciales:', formulario)
    await router.push('/dashboard')
    } catch {
    errores.general = 'Credenciales incorrectas. Inténtalo de nuevo.'
    } finally {
    cargando.value = false
    }
}
</script>