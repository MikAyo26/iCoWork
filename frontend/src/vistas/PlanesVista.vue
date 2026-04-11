<template>
  <div class="space-y-8">

    <!-- Sección Planes -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Planes</h1>
          <p class="text-sm text-gray-400 mt-1">Gestión de planes de suscripción</p>
        </div>
        <button
          @click="abrirModalCrearPlan"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
        >
          <i class="pi pi-plus"></i>
          Nuevo plan
        </button>
      </div>

      <!-- Estado de carga planes -->
      <div v-if="cargandoPlanes" class="flex justify-center py-10">
        <i class="pi pi-spin pi-spinner text-green-500 text-3xl"></i>
      </div>

      <!-- Grid de planes -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="plan in planes"
          :key="plan.id"
          class="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3"
          :class="!plan.activo ? 'opacity-60' : ''"
        >
          <!-- Cabecera -->
          <div class="flex items-start justify-between">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background: linear-gradient(135deg, #8b5cf6, #a78bfa)"
            >
              <i class="pi pi-tag text-white text-base"></i>
            </div>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="plan.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ plan.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <!-- Nombre y precio -->
          <div>
            <h3 class="font-semibold text-gray-800">{{ plan.nombre }}</h3>
            <p class="text-2xl font-bold text-green-600 mt-1">
              {{ Number(plan.precioMensual).toFixed(2) }}€
              <span class="text-xs text-gray-400 font-normal">/mes</span>
            </p>
          </div>

          <!-- Descripción y límite -->
          <div class="space-y-1">
            <p v-if="plan.descripcion" class="text-xs text-gray-400">{{ plan.descripcion }}</p>
            <div class="flex items-center gap-1 text-xs text-gray-500">
              <i class="pi pi-users"></i>
              <span>{{ plan.maxUsuarios ? `Máx. ${plan.maxUsuarios} usuarios` : 'Usuarios ilimitados' }}</span>
            </div>
          </div>

          <!-- Botón desactivar -->
          <button
            v-if="plan.activo"
            @click="confirmarDesactivarPlan(plan)"
            class="mt-auto w-full py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <i class="pi pi-ban mr-1"></i>
            Desactivar
          </button>
        </div>
      </div>
    </div>

    <!-- Separador -->
    <div class="h-px bg-gray-100"></div>

    <!-- Sección Suscripciones -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Suscripciones</h2>
          <p class="text-sm text-gray-400 mt-1">Suscripciones activas por cliente</p>
        </div>
        <button
          @click="abrirModalCrearSuscripcion"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
        >
          <i class="pi pi-plus"></i>
          Nueva suscripción
        </button>
      </div>

      <!-- Estado de carga suscripciones -->
      <div v-if="cargandoSuscripciones" class="flex justify-center py-10">
        <i class="pi pi-spin pi-spinner text-green-500 text-3xl"></i>
      </div>

      <!-- Tabla de suscripciones -->
      <div v-else class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inicio</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fin</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="suscripcion in suscripciones"
              :key="suscripcion.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 text-gray-700 font-medium">Cliente #{{ suscripcion.clienteId }}</td>
              <td class="px-6 py-4">
                <span class="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                  {{ suscripcion.plan?.nombre ?? `Plan #${suscripcion.planId}` }}
                </span>
              </td>
              <td class="px-6 py-4 text-xs text-gray-500">{{ formatearFecha(suscripcion.fechaInicio) }}</td>
              <td class="px-6 py-4 text-xs text-gray-500">{{ suscripcion.fechaFin ? formatearFecha(suscripcion.fechaFin) : '—' }}</td>
              <td class="px-6 py-4">
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="badgeEstado(suscripcion.estado)"
                >
                  {{ etiquetaEstado(suscripcion.estado) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  v-if="suscripcion.estado === 'activa'"
                  @click="confirmarCancelarSuscripcion(suscripcion)"
                  class="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <i class="pi pi-times mr-1"></i>
                  Cancelar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="suscripciones.length === 0"
          class="text-center py-12 text-gray-400"
        >
          <i class="pi pi-credit-card text-3xl mb-2 block"></i>
          <p class="text-sm">No hay suscripciones registradas</p>
        </div>
      </div>
    </div>

    <!-- Modal crear plan -->
    <div
      v-if="modalCrearPlanVisible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="modalCrearPlanVisible = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold text-gray-800">Nuevo plan</h2>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</label>
          <input
            v-model="formularioPlan.nombre"
            type="text"
            placeholder="Básico, Profesional..."
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Precio mensual (€)</label>
            <input
              v-model.number="formularioPlan.precioMensual"
              type="number"
              min="0"
              step="0.01"
              placeholder="9.90"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Máx. usuarios</label>
            <input
              v-model.number="formularioPlan.maxUsuarios"
              type="number"
              min="1"
              placeholder="Vacío = ilimitado"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</label>
          <textarea
            v-model="formularioPlan.descripcion"
            rows="2"
            placeholder="Descripción del plan (opcional)"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          ></textarea>
        </div>

        <div v-if="errorModalPlan" class="bg-red-50 border border-red-100 rounded-lg p-3">
          <p class="text-red-500 text-xs">{{ errorModalPlan }}</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="modalCrearPlanVisible = false"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="guardarPlan"
            :disabled="guardando"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
          >
            <i v-if="guardando" class="pi pi-spin pi-spinner mr-1"></i>
            {{ guardando ? 'Guardando...' : 'Crear plan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal crear suscripción -->
    <div
      v-if="modalCrearSuscripcionVisible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="modalCrearSuscripcionVisible = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold text-gray-800">Nueva suscripción</h2>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">ID del cliente</label>
          <input
            v-model.number="formularioSuscripcion.clienteId"
            type="number"
            min="1"
            placeholder="ID del cliente"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</label>
          <select
            v-model.number="formularioSuscripcion.planId"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="" disabled>Selecciona un plan</option>
            <option v-for="plan in planes" :key="plan.id" :value="plan.id">
              {{ plan.nombre }} — {{ Number(plan.precioMensual).toFixed(2) }}€/mes
            </option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de inicio</label>
          <input
            v-model="formularioSuscripcion.fechaInicio"
            type="date"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div v-if="errorModalSuscripcion" class="bg-red-50 border border-red-100 rounded-lg p-3">
          <p class="text-red-500 text-xs">{{ errorModalSuscripcion }}</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="modalCrearSuscripcionVisible = false"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="guardarSuscripcion"
            :disabled="guardando"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
          >
            <i v-if="guardando" class="pi pi-spin pi-spinner mr-1"></i>
            {{ guardando ? 'Guardando...' : 'Crear suscripción' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { type Plan, obtenerPlanes, crearPlan, desactivarPlan } from '../servicios/planes'
import { type Suscripcion, crearSuscripcion, cancelarSuscripcion } from '../servicios/suscripciones'
import instanciaAxios from '../servicios/axios'

/** Lista de planes cargados desde el backend */
const planes = ref<Plan[]>([])

/** Lista de suscripciones cargadas desde el backend */
const suscripciones = ref<Suscripcion[]>([])

/** Estado de carga de planes */
const cargandoPlanes = ref(true)

/** Estado de carga de suscripciones */
const cargandoSuscripciones = ref(true)

/** Indica si hay una petición de guardado en curso */
const guardando = ref(false)

/** Controla la visibilidad del modal de creación de plan */
const modalCrearPlanVisible = ref(false)

/** Controla la visibilidad del modal de creación de suscripción */
const modalCrearSuscripcionVisible = ref(false)

/** Mensaje de error del modal de plan */
const errorModalPlan = ref('')

/** Mensaje de error del modal de suscripción */
const errorModalSuscripcion = ref('')

/** Datos reactivos del formulario de creación de plan */
const formularioPlan = reactive({
  nombre: '',
  precioMensual: 0,
  maxUsuarios: undefined as number | undefined,
  descripcion: '',
})

/** Datos reactivos del formulario de creación de suscripción */
const formularioSuscripcion = reactive({
  clienteId: undefined as number | undefined,
  planId: undefined as number | undefined,
  fechaInicio: '',
})

/**
 * Carga planes (incluyendo inactivos) y todas las suscripciones al montar.
 * Usa el nuevo endpoint global GET /suscripciones para superadmin.
 */
onMounted(async () => {
  try {
    /** Superadmin usa /planes/todos para ver también los inactivos */
    const respuesta = await instanciaAxios.get<Plan[]>('/planes/todos')
    planes.value = respuesta.data
  } finally {
    cargandoPlanes.value = false
  }

  try {
    /** Endpoint global GET /suscripciones — solo superadmin */
    const respuesta = await instanciaAxios.get<Suscripcion[]>('/suscripciones')
    suscripciones.value = respuesta.data
  } finally {
    cargandoSuscripciones.value = false
  }
})

/** Abre el modal de creación de plan limpiando el formulario */
function abrirModalCrearPlan() {
  formularioPlan.nombre = ''
  formularioPlan.precioMensual = 0
  formularioPlan.maxUsuarios = undefined
  formularioPlan.descripcion = ''
  errorModalPlan.value = ''
  modalCrearPlanVisible.value = true
}

/** Abre el modal de creación de suscripción limpiando el formulario */
function abrirModalCrearSuscripcion() {
  formularioSuscripcion.clienteId = undefined
  formularioSuscripcion.planId = undefined
  formularioSuscripcion.fechaInicio = ''
  errorModalSuscripcion.value = ''
  modalCrearSuscripcionVisible.value = true
}

/** Valida y envía el nuevo plan al backend */
async function guardarPlan() {
  errorModalPlan.value = ''

  if (!formularioPlan.nombre || formularioPlan.precioMensual < 0) {
    errorModalPlan.value = 'Nombre y precio son obligatorios'
    return
  }

  guardando.value = true
  try {
    await crearPlan({
      nombre: formularioPlan.nombre,
      precioMensual: formularioPlan.precioMensual,
      maxUsuarios: formularioPlan.maxUsuarios,
      descripcion: formularioPlan.descripcion || undefined,
    })
    /** Recarga usando /planes/todos para mantener visibles los inactivos */
    const respuesta = await instanciaAxios.get<Plan[]>('/planes/todos')
    planes.value = respuesta.data
    modalCrearPlanVisible.value = false
  } catch {
    errorModalPlan.value = 'No se pudo crear el plan.'
  } finally {
    guardando.value = false
  }
}

/**
 * Valida y envía la nueva suscripción al backend.
 * Recarga la lista usando el endpoint global tras una creación exitosa.
 */
async function guardarSuscripcion() {
  errorModalSuscripcion.value = ''

  if (!formularioSuscripcion.clienteId || !formularioSuscripcion.planId) {
    errorModalSuscripcion.value = 'Cliente y plan son obligatorios'
    return
  }

  guardando.value = true
  try {
    await crearSuscripcion({
      clienteId: formularioSuscripcion.clienteId,
      planId: formularioSuscripcion.planId,
      fechaInicio: formularioSuscripcion.fechaInicio || undefined,
    })
    /** Recarga usando endpoint global */
    const respuesta = await instanciaAxios.get<Suscripcion[]>('/suscripciones')
    suscripciones.value = respuesta.data
    modalCrearSuscripcionVisible.value = false
  } catch {
    errorModalSuscripcion.value = 'No se pudo crear la suscripción. El cliente puede ya tener una activa.'
  } finally {
    guardando.value = false
  }
}

/** Confirma y desactiva un plan */
async function confirmarDesactivarPlan(plan: Plan) {
  if (!confirm(`¿Desactivar el plan "${plan.nombre}"?`)) return
  try {
    await desactivarPlan(plan.id)
    const respuesta = await instanciaAxios.get<Plan[]>('/planes/todos')
    planes.value = respuesta.data
  } catch {
    alert('No se pudo desactivar el plan.')
  }
}

/**
 * Confirma y cancela una suscripción.
 * Recarga la lista usando el endpoint global tras la cancelación.
 */
async function confirmarCancelarSuscripcion(suscripcion: Suscripcion) {
  if (!confirm(`¿Cancelar la suscripción #${suscripcion.id}?`)) return
  try {
    await cancelarSuscripcion(suscripcion.id)
    /** Recarga usando endpoint global */
    const respuesta = await instanciaAxios.get<Suscripcion[]>('/suscripciones')
    suscripciones.value = respuesta.data
  } catch {
    alert('No se pudo cancelar la suscripción.')
  }
}

/** Devuelve las clases del badge según el estado de la suscripción */
function badgeEstado(estado: string): string {
  const badges: Record<string, string> = {
    activa:    'bg-green-100 text-green-700',
    cancelada: 'bg-red-100 text-red-700',
    expirada:  'bg-gray-100 text-gray-600',
  }
  return badges[estado] ?? 'bg-gray-100 text-gray-600'
}

/** Devuelve la etiqueta legible del estado */
function etiquetaEstado(estado: string): string {
  const etiquetas: Record<string, string> = {
    activa:    'Activa',
    cancelada: 'Cancelada',
    expirada:  'Expirada',
  }
  return etiquetas[estado] ?? estado
}

/** Formatea una fecha ISO a formato legible en español */
function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>