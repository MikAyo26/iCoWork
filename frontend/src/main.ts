// Importación de la función principal de Vue para crear la aplicación
import { createApp } from 'vue'

// Importación de PrimeVue y su tema visual Aura
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

// Importación de los iconos de PrimeVue y los estilos globales de la aplicación
import 'primeicons/primeicons.css'
import './style.css'

// Importación del componente raíz y el enrutador
import App from './App.vue'
import router from './enrutador'

// Creación de la instancia principal de la aplicación Vue
const app = createApp(App)

// Registro de PrimeVue con el tema Aura y soporte para modo oscuro
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      // Selector CSS que activa el modo oscuro al añadir la clase .dark al HTML
      darkModeSelector: '.dark',
    },
  },
})

// Registro del enrutador para la navegación entre vistas
app.use(router)

// Montaje de la aplicación sobre el elemento #app del index.html
app.mount('#app')