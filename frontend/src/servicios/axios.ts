import axios from 'axios'

/**
 * Instancia global de Axios configurada para comunicarse con la API de iCoWork.
 * Todas las peticiones al backend deben usar esta instancia.
 */
const instanciaAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Interceptor de petición.
 * Añade automáticamente el token JWT al header Authorization si existe.
 */
instanciaAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Interceptor de respuesta.
 * Si el servidor devuelve 401 (no autorizado), limpia el token y redirige al login.
 */
instanciaAxios.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default instanciaAxios