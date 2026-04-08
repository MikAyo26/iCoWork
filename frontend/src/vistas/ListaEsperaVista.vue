    <template>
    <div class="space-y-6">

        <!-- Cabecera -->
        <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-800">Lista de Espera</h1>
            <p class="text-sm text-gray-400 mt-1">Espacios que sigues y recibirás aviso cuando estén disponibles</p>
        </div>
        <button
            @click="abrirModal"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
        >
            <i class="pi pi-plus"></i>
            Añadirme a lista
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
        <div v-else class="flex flex-wrap gap-4">
        <div
            v-for="entrada in listaEspera"
            :key="entrada.id"
            class="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 w-64"
        >
            <!-- Icono y badge de estado -->
            <div class="flex items-start justify-between">
            <div
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                :style="{ background: entrada.notificadoEn
                ? 'linear-gradient(135deg, #42b883, #2d8f6f)'
                : 'linear-gradient(135deg, #3b82f6, #60a5fa)' }"
            >
                <i class="pi pi-clock text-white text-base"></i>
            </div>
            <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="entrada.notificadoEn
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'"
            >
                {{ entrada.notificadoEn ? 'Notificado' : 'En espera' }}
            </span>
            </div>

            <!-- Nombre y oficina -->
            <div>
            <h3 class="font-semibold text-gray-800">
                {{ entrada.espacio?.nombre ?? `Espacio #${entrada.espacioId}` }}
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">
                {{ entrada.espacio?.oficina?.nombre ?? '' }}
            </p>
            </div>

            <!-- Fecha deseada -->
            <div class="space-y-1">
            <div class="flex items-center gap-1 text-xs text-gray-500">
                <i class="pi pi-calendar"></i>
                <span>{{ formatearFecha(entrada.fechaDeseada) }}</span>
            </div>
            <div v-if="entrada.notificadoEn" class="flex items-center gap-1 text-xs text-green-600">
                <i class="pi pi-check-circle"></i>
                <span>Notificado el {{ formatearFecha(entrada.notificadoEn) }}</span>
            </div>
            <div class="flex items-center gap-1 text-xs text-gray-400">
                <i class="pi pi-clock"></i>
                <span>Apuntado el {{ formatearFecha(entrada.creadoEn) }}</span>
            </div>
            </div>

            <!-- Botón salir de la lista -->
            <button
            @click="confirmarSalida(entrada)"
            class="mt-auto w-full py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
            >
            <i class="pi pi-times mr-1"></i>
            Salir de la lista
            </button>
        </div>
        </div>

        <!-- Sin resultados -->
        <div
        v-if="!cargando && !error && listaEspera.length === 0"
        class="text-center py-20 text-gray-400"
        >
        <i class="pi pi-clock text-4xl mb-3 block"></i>
        <p class="text-sm">No estás en ninguna lista de espera</p>
        </div>

        <!-- Modal añadirse a lista de espera -->
        <div
        v-if="modalVisible"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        @click.self="modalVisible = false"
        >
        <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 class="text-lg font-bold text-gray-800">Añadirme a lista de espera</h2>

            <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Espacio</label>
            <select
                v-model="formulario.espacioId"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
                <option value="" disabled>Selecciona un espacio</option>
                <option v-for="e in espacios" :key="e.id" :value="e.id">
                {{ e.nombre }} — {{ etiquetaTipo(e.tipo) }}
                </option>
            </select>
            </div>

            <div class="space-y-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha deseada</label>
            <input
                v-model="formulario.fechaDeseada"
                type="date"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            </div>

            <div v-if="errorModal" class="bg-red-50 border border-red-100 rounded-lg p-3">
            <p class="text-red-500 text-xs">{{ errorModal }}</p>
            </div>

            <div class="flex gap-3 pt-2">
            <button
                @click="modalVisible = false"
                class="flex-1 py-2 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
                Cancelar
            </button>
            <button
                @click="guardar"
                :disabled="guardando"
                class="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
            >
                <i v-if="guardando" class="pi pi-spin pi-spinner mr-1"></i>
                {{ guardando ? 'Guardando...' : 'Añadirme' }}
            </button>
            </div>
        </div>
        </div>

    </div>
    </template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
    type EntradaListaEspera,
    obtenerMiListaEspera,
    unirseListaEspera,
    salirListaEspera,
} from '../servicios/lista-espera'
import { obtenerEspaciosPorOficina, type Espacio } from '../servicios/espacios'

/** Lista de espera del usuario */
const listaEspera = ref<EntradaListaEspera[]>([])

/** Espacios disponibles para el selector del modal */
const espacios = ref<Espacio[]>([])

/** Estado de carga inicial */
const cargando = ref(true)

/** Mensaje de error general */
const error = ref('')

/** Mensaje de error del modal */
const errorModal = ref('')

/** Controla la visibilidad del modal */
const modalVisible = ref(false)

/** Indica si hay una petición en curso */
const guardando = ref(false)

/** Datos del formulario */
const formulario = reactive({
    espacioId: '' as number | '',
    fechaDeseada: '',
    })

/** Carga la lista de espera y los espacios al montar el componente */
onMounted(async () => {
    try {
        const [lista, espaciosOficina] = await Promise.all([
        obtenerMiListaEspera(),
        obtenerEspaciosPorOficina(1),
    ])
        listaEspera.value = lista
        espacios.value = espaciosOficina
    } catch {
        error.value = 'No se pudo cargar la lista de espera. Inténtalo de nuevo.'
    } finally {
        cargando.value = false
    }
})

/** Abre el modal limpiando el formulario */
function abrirModal() {
    formulario.espacioId = ''
    formulario.fechaDeseada = ''
    errorModal.value = ''
    modalVisible.value = true
}

/** Guarda la entrada en la lista de espera */
async function guardar() {
    errorModal.value = ''

    if (!formulario.espacioId || !formulario.fechaDeseada) {
        errorModal.value = 'Selecciona un espacio y una fecha'
        return
    }

    guardando.value = true
    try {
    await unirseListaEspera(
        formulario.espacioId as number,
        formulario.fechaDeseada,
    )
        listaEspera.value = await obtenerMiListaEspera()
        modalVisible.value = false
    } catch {
        errorModal.value = 'No se pudo añadirte. Es posible que ya estés en esta lista.'
    } finally {
        guardando.value = false
    }
}

/** Confirma y elimina la entrada de la lista de espera */
async function confirmarSalida(entrada: EntradaListaEspera) {
    if (!confirm(`¿Salir de la lista de espera de "${entrada.espacio?.nombre ?? 'este espacio'}"?`)) return
    try {
        await salirListaEspera(entrada.id)
        listaEspera.value = listaEspera.value.filter((e) => e.id !== entrada.id)
    } catch {
        alert('No se pudo salir de la lista de espera.')
    }
}

/** Devuelve la etiqueta legible del tipo de espacio */
function etiquetaTipo(tipo: string): string {
    const etiquetas: Record<string, string> = {
        puesto:      'Puesto',
        sala_juntas: 'Sala de juntas',
        cabina:      'Cabina',
        otro:        'Otro',
        }
    return etiquetas[tipo] ?? tipo
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