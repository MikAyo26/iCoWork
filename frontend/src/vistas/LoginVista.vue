<template>
  <!-- Contenedor principal centrado en pantalla completa -->
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm flex flex-col items-center gap-6">

      <!-- Logo de la aplicación -->
      <div class="flex flex-col items-center gap-1">
        <img src="../assets/logo.png" alt="iCoWork" class="w-90" />
        <p class="text-lg font-medium" style="color: #42b883">Reserva · Gestiona tus espacios</p>
      </div>

      <!-- Separador visual -->
      <div class="w-full h-px bg-gray-100"></div>

      <!-- Cabecera del formulario -->
      <div class="w-full text-center">
        <h2 class="text-lg font-semibold text-gray-700">Accede a tu cuenta</h2>
      </div>

      <!-- Formulario de login — @submit.prevent evita la recarga de página -->
      <form class="w-full flex flex-col gap-4" @submit.prevent="manejarLogin">

        <!-- Campo de correo electrónico -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</label>
          <InputText
            v-model="formulario.correo"
            type="email"
            placeholder="tu@correo.com"
            class="w-full"
            :invalid="!!errores.correo"
          />
          <!-- Mensaje de error del campo correo -->
          <small v-if="errores.correo" class="text-red-400 text-xs">{{ errores.correo }}</small>
        </div>

        <!-- Campo de contraseña con toggle de visibilidad -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Contraseña</label>
          <Password
            v-model="formulario.contrasena"
            placeholder="••••••••"
            class="w-full"
            input-class="w-full"
            :feedback="false"
            toggle-mask
            :invalid="!!errores.contrasena"
          />
          <!-- Mensaje de error del campo contraseña -->
          <small v-if="errores.contrasena" class="text-red-400 text-xs">{{ errores.contrasena }}</small>
        </div>

        <!-- Mensaje de error general (credenciales incorrectas) -->
        <div v-if="errores.general" class="bg-red-50 border border-red-100 rounded-lg p-3">
          <p class="text-red-500 text-xs text-center">{{ errores.general }}</p>
        </div>

        <!-- Botón de envío con estado de carga -->
        <Button
          type="submit"
          label="Entrar"
          icon="pi pi-sign-in"
          class="w-full mt-1 transition-shadow duration-200 hover:shadow-lg"
          :loading="cargando"
          :style="{ background: 'linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)', border: 'none' }"
        />

        <!-- Enlace de recuperación de contraseña (funcionalidad futura) -->
        <p class="text-center text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
          ¿Olvidaste tu contraseña?
        </p>

      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

// Componentes de PrimeVue para el formulario
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

// Servicio de autenticación
import { iniciarSesion } from '../servicios/autenticacion'

const router = useRouter()

/** Estado reactivo del formulario de login */
const formulario = reactive({
  correo: '',
  contrasena: '',
})

/** Mensajes de error por campo y error general */
const errores = reactive({
  correo: '',
  contrasena: '',
  general: '',
})

/** Indica si la petición de login está en curso para mostrar el spinner */
const cargando = ref(false)

/**
 * Valida los campos del formulario antes de enviar la petición.
 * Limpia los errores previos y comprueba que los campos no estén vacíos.
 * @returns true si el formulario es válido, false si hay errores
 */
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

/**
 * Gestiona el envío del formulario de login.
 * Valida los campos, llama al servicio de autenticación,
 * almacena el token y los datos del usuario en localStorage
 * y redirige al dashboard si las credenciales son correctas.
 */
async function manejarLogin() {
  if (!validar()) return

  cargando.value = true

  try {
    const respuesta = await iniciarSesion({
      correo: formulario.correo,
      contrasena: formulario.contrasena,
    })

    // Persistir token JWT y datos del usuario para mantener la sesión
    localStorage.setItem('token', respuesta.accessToken)
    localStorage.setItem('usuario', JSON.stringify(respuesta.usuario))

    // Redirigir al dashboard tras login exitoso
    await router.push('/dashboard')
  } catch {
    // Mostrar error general si las credenciales son incorrectas
    errores.general = 'Credenciales incorrectas. Inténtalo de nuevo.'
  } finally {
    cargando.value = false
  }
}
</script>