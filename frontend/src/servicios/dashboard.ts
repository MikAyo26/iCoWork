import instanciaAxios from './axios'

/** Obtiene las reservas confirmadas del usuario autenticado */
export async function obtenerMisReservas() {
    const respuesta = await instanciaAxios.get('/reservas/mis-reservas')
    return respuesta.data
}

/** Obtiene los espacios de una oficina */
export async function obtenerEspaciosPorOficina(oficina: number) {
    const respuesta = await instanciaAxios.get(`/espacios/oficina/${oficina}`)
    return respuesta.data
}

/** Obtiene las notificaciones del usuario autenticado */
export async function obtenerNotificaciones() {
    const respuesta = await instanciaAxios.get('/notificaciones')
    return respuesta.data
}

/** Obtiene la ocupación global — solo superadmin */
export async function obtenerOcupacionGlobal() {
    const respuesta = await instanciaAxios.get('/dashboard/global')
    return respuesta.data
}

/** Obtiene el resumen de un cliente — admin y superadmin */
export async function obtenerResumenCliente(clienteId: number) {
    const respuesta = await instanciaAxios.get(`/dashboard/cliente/${clienteId}`)
    return respuesta.data
}