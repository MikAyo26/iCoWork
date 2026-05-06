<template>
  <div class="space-y-6">

    <!-- Cabecera -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Pagos</h1>
        <p class="text-sm text-gray-400 mt-1">Historial de pagos y transacciones</p>
      </div>
      <!-- Botón nuevo pago — solo admin -->
      <button
        v-if="tieneRol('admin')"
        @click="abrirModalNuevoPago"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
      >
        <i class="pi pi-plus"></i>
        Nuevo pago
      </button>
    </div>

    <!-- Tarjetas de estadísticas — solo admin y superadmin -->
    <div v-if="tieneRol('superadmin', 'admin')" class="flex flex-wrap gap-4">
      <div class="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-2 w-52">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center"
          style="background: linear-gradient(135deg, #2d8f6f, #42b883)"
        >
          <i class="pi pi-credit-card text-white text-base"></i>
        </div>
        <p class="text-xs text-gray-400 uppercase tracking-wide">Total pagado</p>
        <p class="text-2xl font-bold text-gray-800">{{ Number(estadisticas.totalPagado).toFixed(2) }}€</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-2 w-52">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center"
          style="background: linear-gradient(135deg, #3b82f6, #60a5fa)"
        >
          <i class="pi pi-receipt text-white text-base"></i>
        </div>
        <p class="text-xs text-gray-400 uppercase tracking-wide">Total pagos</p>
        <p class="text-2xl font-bold text-gray-800">{{ estadisticas.totalPagos }}</p>
      </div>
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

    <!-- Tabla de pagos -->
    <div v-else class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Referencia</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Importe</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Método</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="pago in pagosFiltrados"
            :key="pago.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <!-- Referencia -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  :style="{ background: colorEstado(pago.estado) }"
                >
                  <i class="pi pi-credit-card text-white text-xs"></i>
                </div>
                <div>
                  <p class="font-medium text-gray-800 text-xs">#{{ pago.id }}</p>
                  <p v-if="pago.referenciaExterna" class="text-xs text-gray-400 truncate max-w-32">
                    {{ pago.referenciaExterna }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Importe -->
            <td class="px-6 py-4 font-semibold text-gray-800">
              {{ Number(pago.importe).toFixed(2) }} {{ pago.moneda }}
            </td>

            <!-- Método -->
            <td class="px-6 py-4 text-gray-500 text-xs capitalize">
              {{ pago.metodo ?? '—' }}
            </td>

            <!-- Estado -->
            <td class="px-6 py-4">
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="badgeEstado(pago.estado)"
              >
                {{ etiquetaEstado(pago.estado) }}
              </span>
            </td>

            <!-- Fecha -->
            <td class="px-6 py-4 text-xs text-gray-500">
              {{ pago.pagadoEn ? formatearFecha(pago.pagadoEn) : formatearFecha(pago.creadoEn) }}
            </td>

            <!-- Acciones — confirmar solo superadmin -->
            <td class="px-6 py-4 text-right">
              <button
                v-if="pago.estado === 'pendiente' && tieneRol('superadmin')"
                @click="confirmar(pago)"
                class="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
              >
                <i class="pi pi-check mr-1"></i>
                Confirmar
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Sin resultados -->
      <div
        v-if="pagosFiltrados.length === 0"
        class="text-center py-12 text-gray-400"
      >
        <i class="pi pi-credit-card text-3xl mb-2 block"></i>
        <p class="text-sm">No hay pagos {{ filtroActivo !== 'todos' ? `con estado "${filtroActivo}"` : '' }}</p>
      </div>
    </div>

    <!-- Modal nuevo pago — solo admin -->
    <div
      v-if="modalNuevoPagoVisible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="modalNuevoPagoVisible = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold text-gray-800">Nuevo pago</h2>

        <!-- Selector de usuario -->
        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</label>
          <select
            v-model.number="formularioPago.usuarioId"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="" disabled>Selecciona un usuario</option>
            <option
              v-for="u in usuariosCliente"
              :key="u.id"
              :value="u.id"
            >
              {{ u.nombre }} — {{ u.correo }}
            </option>
          </select>
        </div>

        <!-- Importe -->
        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Importe (€)</label>
          <input
            v-model.number="formularioPago.importe"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <!-- Método de pago -->
        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Método de pago</label>
          <select
            v-model="formularioPago.metodo"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="efectivo">Efectivo</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <!-- Referencia externa -->
        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia externa</label>
          <input
            v-model="formularioPago.referenciaExterna"
            type="text"
            placeholder="Opcional"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div v-if="errorModalPago" class="bg-red-50 border border-red-100 rounded-lg p-3">
          <p class="text-red-500 text-xs">{{ errorModalPago }}</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="modalNuevoPagoVisible = false"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="guardarPago"
            :disabled="guardandoPago"
            class="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
          >
            <i v-if="guardandoPago" class="pi pi-spin pi-spinner mr-1"></i>
            {{ guardandoPago ? 'Guardando...' : 'Registrar pago' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { type Pago, obtenerMisPagos, confirmarPago, obtenerEstadisticasPagos, obtenerTodosLosPagos, obtenerEstadisticasGlobales, registrarPago } from '../servicios/pagos'
import { type Usuario, obtenerUsuarios } from '../servicios/usuarios'
import { useUsuarioActual } from '../composiciones/useUsuarioActual'

const { tieneRol, usuario } = useUsuarioActual()

/** Lista de pagos */
const pagos = ref<Pago[]>([])

/** Usuarios del cliente para el selector del modal */
const usuariosCliente = ref<Usuario[]>([])

/** Estadísticas de pagos */
const estadisticas = ref({ totalPagado: 0, totalPagos: 0 })

/** Estado de carga */
const cargando = ref(true)

/** Mensaje de error general */
const error = ref('')

/** Controla la visibilidad del modal de nuevo pago */
const modalNuevoPagoVisible = ref(false)

/** Indica si hay una petición de guardado en curso */
const guardandoPago = ref(false)

/** Mensaje de error del modal */
const errorModalPago = ref('')

/** Datos reactivos del formulario de nuevo pago */
const formularioPago = reactive({
  usuarioId: '' as number | '',
  importe: 0,
  metodo: 'tarjeta',
  referenciaExterna: '',
})

/** Filtro activo por estado */
const filtroActivo = ref('todos')

/** Opciones de filtro */
const filtros = [
  { valor: 'todos',       etiqueta: 'Todos' },
  { valor: 'pendiente',   etiqueta: 'Pendientes' },
  { valor: 'completado',  etiqueta: 'Completados' },
  { valor: 'fallido',     etiqueta: 'Fallidos' },
  { valor: 'reembolsado', etiqueta: 'Reembolsados' },
]

/** Pagos filtrados según el estado seleccionado */
const pagosFiltrados = computed(() => {
  if (filtroActivo.value === 'todos') return pagos.value
  return pagos.value.filter((p) => p.estado === filtroActivo.value)
})

/** Carga los pagos y estadísticas al montar el componente */
onMounted(async () => {
  try {
    if (tieneRol('superadmin')) {
      pagos.value = await obtenerTodosLosPagos()
      estadisticas.value = await obtenerEstadisticasGlobales()
    } else {
      pagos.value = await obtenerMisPagos()
      if (tieneRol('admin') && usuario.value?.clienteId) {
        estadisticas.value = await obtenerEstadisticasPagos(usuario.value.clienteId)
        /** Carga usuarios del cliente para el selector del modal */
        const todosUsuarios = await obtenerUsuarios()
        usuariosCliente.value = todosUsuarios.filter(
          (u) => u.rol !== 'superadmin'
        )
      }
    }
  } catch {
    error.value = 'No se pudieron cargar los pagos. Inténtalo de nuevo.'
  } finally {
    cargando.value = false
  }
})

/** Abre el modal limpiando el formulario */
function abrirModalNuevoPago() {
  formularioPago.usuarioId = ''
  formularioPago.importe = 0
  formularioPago.metodo = 'tarjeta'
  formularioPago.referenciaExterna = ''
  errorModalPago.value = ''
  modalNuevoPagoVisible.value = true
}

/** Valida y registra el nuevo pago */
async function guardarPago() {
  errorModalPago.value = ''

  if (!formularioPago.usuarioId || formularioPago.importe <= 0) {
    errorModalPago.value = 'Usuario e importe son obligatorios'
    return
  }

  guardandoPago.value = true
  try {
    await registrarPago({
      usuarioId: formularioPago.usuarioId as number,
      importe: formularioPago.importe,
      moneda: 'EUR',
      metodo: formularioPago.metodo,
      referenciaExterna: formularioPago.referenciaExterna || undefined,
    })
    pagos.value = await obtenerMisPagos()
    if (usuario.value?.clienteId) {
      estadisticas.value = await obtenerEstadisticasPagos(usuario.value.clienteId)
    }
    modalNuevoPagoVisible.value = false
  } catch {
    errorModalPago.value = 'No se pudo registrar el pago.'
  } finally {
    guardandoPago.value = false
  }
}

/** Confirma un pago pendiente y recarga la lista */
async function confirmar(pago: Pago) {
  if (!confirm(`¿Confirmar el pago #${pago.id} por ${Number(pago.importe).toFixed(2)} ${pago.moneda}?`)) return
  try {
    await confirmarPago(pago.id)
    pagos.value = await obtenerMisPagos()
  } catch {
    alert('No se pudo confirmar el pago.')
  }
}

/** Devuelve el gradiente de color según el estado del pago */
function colorEstado(estado: string): string {
  const colores: Record<string, string> = {
    completado:  'linear-gradient(135deg, #2d8f6f, #42b883)',
    pendiente:   'linear-gradient(135deg, #f59e0b, #fbbf24)',
    fallido:     'linear-gradient(135deg, #ef4444, #f87171)',
    reembolsado: 'linear-gradient(135deg, #6b7280, #9ca3af)',
  }
  return colores[estado] ?? 'linear-gradient(135deg, #6b7280, #9ca3af)'
}

/** Devuelve las clases del badge según el estado */
function badgeEstado(estado: string): string {
  const badges: Record<string, string> = {
    completado:  'bg-green-100 text-green-700',
    pendiente:   'bg-yellow-100 text-yellow-700',
    fallido:     'bg-red-100 text-red-700',
    reembolsado: 'bg-gray-100 text-gray-600',
  }
  return badges[estado] ?? 'bg-gray-100 text-gray-600'
}

/** Devuelve la etiqueta legible del estado */
function etiquetaEstado(estado: string): string {
  const etiquetas: Record<string, string> = {
    completado:  'Completado',
    pendiente:   'Pendiente',
    fallido:     'Fallido',
    reembolsado: 'Reembolsado',
  }
  return etiquetas[estado] ?? estado
}

/** Formatea una fecha ISO a formato legible en español */
function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>