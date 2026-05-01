import instanciaAxios from './axios'

/**
 * Obtiene la ocupación global de todos los clientes.
 * Solo accesible por superadmin.
 */
export async function obtenerOcupacionGlobal() {
    const respuesta = await instanciaAxios.get('/dashboard/global')
    return respuesta.data
}

/**
 * Obtiene el resumen de ocupación de los espacios de un cliente.
 * Accesible por superadmin y admin.
 * @param clienteId ID del cliente a consultar
 */
export async function obtenerResumenCliente(clienteId: number) {
    const respuesta = await instanciaAxios.get(`/dashboard/cliente/${clienteId}`)
    return respuesta.data
}

/**
 * Obtiene las franjas horarias con mayor número de reservas.
 * Solo accesible por superadmin.
 */
export async function obtenerHorasPico() {
    const respuesta = await instanciaAxios.get('/dashboard/horas-pico')
    return respuesta.data
}

/**
 * Obtiene las estadísticas de asistencia de los empleados de un cliente.
 * @param clienteId ID del cliente a consultar
 */
export async function obtenerAsistencia(clienteId: number) {
    const respuesta = await instanciaAxios.get(`/dashboard/cliente/${clienteId}/asistencia`)
    return respuesta.data
}

/**
 * Exporta los datos de ocupación de un cliente en formato CSV.
 * @param clienteId ID del cliente a exportar
 */
export async function exportarDatos(clienteId: number) {
    const respuesta = await instanciaAxios.get(`/dashboard/cliente/${clienteId}/exportar`)
    return respuesta.data
}