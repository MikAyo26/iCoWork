    <template>
    <div class="space-y-6">

        <!-- Cabecera -->
        <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-800">Notificaciones</h1>
            <p class="text-sm text-gray-400 mt-1">
            {{ noLeidas }} notificación{{ noLeidas !== 1 ? 'es' : '' }} sin leer
            </p>
        </div>
        <button
            v-if="noLeidas > 0"
            @click="leerTodas"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style="background: linear-gradient(135deg, #2d8f6f 0%, #42b883 100%)"
        >
            <i class="pi pi-check-square"></i>
            Marcar todas como leídas
        </button>
        </div>

        <!-- Filtros -->
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

        <!-- Lista de notificaciones -->
        <div v-else class="space-y-3">
        <div
            v-for="notificacion in notificacionesFiltradas"
            :key="notificacion.id"
            class="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4 transition-opacity duration-150"
            :class="notificacion.leida ? 'opacity-60' : ''"
        >
            <!-- Icono del tipo -->
            <div
            class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            :style="{ background: colorTipo(notificacion.tipo) }"
            >
            <i :class="iconoTipo(notificacion.tipo)" class="text-white text-base"></i>
            </div>

            <!-- Contenido -->
            <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
                <h3 class="font-semibold text-gray-800 text-sm">{{ notificacion.titulo }}</h3>
                <span class="text-xs text-gray-400 flex-shrink-0">
                {{ formatearFecha(notificacion.enviadoEn) }}
                </span>
            </div>
            <p v-if="notificacion.cuerpo" class="text-xs text-gray-500 mt-1">
                {{ notificacion.cuerpo }}
            </p>
            <div class="flex items-center gap-3 mt-2">
                <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="badgeTipo(notificacion.tipo)"
                >
                {{ etiquetaTipo(notificacion.tipo) }}
                </span>
                <span v-if="!notificacion.leida" class="text-xs text-green-600 font-medium">
                Nueva
                </span>
            </div>
            </div>

            <!-- Botón marcar como leída -->
            <button
            v-if="!notificacion.leida"
            @click="leerUna(notificacion)"
            class="flex-shrink-0 text-xs text-gray-400 hover:text-green-600 transition-colors p-1 rounded-lg hover:bg-green-50"
            title="Marcar como leída"
            >
            <i class="pi pi-check text-base"></i>
            </button>
        </div>
        </div>

        <!-- Sin resultados -->
        <div
        v-if="!cargando && !error && notificacionesFiltradas.length === 0"
        class="text-center py-20 text-gray-400"
        >
        <i class="pi pi-bell text-4xl mb-3 block"></i>
        <p class="text-sm">No tienes notificaciones {{ filtroActivo === 'no_leidas' ? 'sin leer' : '' }}</p>
        </div>

    </div>
    </template>

    <script setup lang="ts">
    import { computed, onMounted, ref } from 'vue'
    import {
    type Notificacion,
    obtenerNotificaciones,
    marcarLeida,
    marcarTodasLeidas,
    } from '../servicios/notificaciones'

    /** Lista de notificaciones del usuario */
    const notificaciones = ref<Notificacion[]>([])

    /** Estado de carga inicial */
    const cargando = ref(true)

    /** Mensaje de error general */
    const error = ref('')

    /** Filtro activo */
    const filtroActivo = ref('todas')

    /** Opciones de filtro */
    const filtros = [
    { valor: 'todas',     etiqueta: 'Todas' },
    { valor: 'no_leidas', etiqueta: 'Sin leer' },
    { valor: 'leidas',    etiqueta: 'Leídas' },
    ]

    /** Número de notificaciones sin leer */
    const noLeidas = computed(() =>
    notificaciones.value.filter((n) => !n.leida).length
    )

    /** Notificaciones filtradas según el filtro activo */
    const notificacionesFiltradas = computed(() => {
    if (filtroActivo.value === 'no_leidas') return notificaciones.value.filter((n) => !n.leida)
    if (filtroActivo.value === 'leidas')    return notificaciones.value.filter((n) => n.leida)
    return notificaciones.value
    })

    /** Carga las notificaciones del usuario al montar el componente */
    onMounted(async () => {
    try {
        notificaciones.value = await obtenerNotificaciones()
    } catch {
        error.value = 'No se pudieron cargar las notificaciones. Inténtalo de nuevo.'
    } finally {
        cargando.value = false
    }
    })

    /** Marca una notificación individual como leída */
    async function leerUna(notificacion: Notificacion) {
    try {
        await marcarLeida(notificacion.id)
        notificacion.leida = true
    } catch {
        alert('No se pudo marcar la notificación como leída.')
    }
    }

    /** Marca todas las notificaciones como leídas */
    async function leerTodas() {
    try {
        await marcarTodasLeidas()
        notificaciones.value.forEach((n) => (n.leida = true))
    } catch {
        alert('No se pudieron marcar las notificaciones como leídas.')
    }
    }

    /** Devuelve el gradiente de color según el tipo de notificación */
    function colorTipo(tipo: string): string {
    const colores: Record<string, string> = {
        reserva_confirmada: 'linear-gradient(135deg, #2d8f6f, #42b883)',
        reserva_cancelada:  'linear-gradient(135deg, #ef4444, #f87171)',
        espera_disponible:  'linear-gradient(135deg, #3b82f6, #60a5fa)',
        recibo_pago:        'linear-gradient(135deg, #8b5cf6, #a78bfa)',
        otro:               'linear-gradient(135deg, #6b7280, #9ca3af)',
    }
    return colores[tipo] ?? 'linear-gradient(135deg, #6b7280, #9ca3af)'
    }

    /** Devuelve el icono según el tipo de notificación */
    function iconoTipo(tipo: string): string {
    const iconos: Record<string, string> = {
        reserva_confirmada: 'pi pi-calendar-plus',
        reserva_cancelada:  'pi pi-calendar-times',
        espera_disponible:  'pi pi-clock',
        recibo_pago:        'pi pi-credit-card',
        otro:               'pi pi-bell',
    }
    return iconos[tipo] ?? 'pi pi-bell'
    }

    /** Devuelve las clases del badge según el tipo */
    function badgeTipo(tipo: string): string {
    const badges: Record<string, string> = {
        reserva_confirmada: 'bg-green-100 text-green-700',
        reserva_cancelada:  'bg-red-100 text-red-700',
        espera_disponible:  'bg-blue-100 text-blue-700',
        recibo_pago:        'bg-purple-100 text-purple-700',
        otro:               'bg-gray-100 text-gray-600',
    }
    return badges[tipo] ?? 'bg-gray-100 text-gray-600'
    }

    /** Devuelve la etiqueta legible del tipo de notificación */
    function etiquetaTipo(tipo: string): string {
    const etiquetas: Record<string, string> = {
        reserva_confirmada: 'Reserva confirmada',
        reserva_cancelada:  'Reserva cancelada',
        espera_disponible:  'Espacio disponible',
        recibo_pago:        'Pago',
        otro:               'General',
    }
    return etiquetas[tipo] ?? tipo
    }

    /** Formatea una fecha ISO a formato legible relativo */
    function formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    })
    }
    </script>