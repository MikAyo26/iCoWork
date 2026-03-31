import { createRouter, createWebHistory } from 'vue-router'
import LoginVista from '../vistas/LoginVista.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
    {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/login',
        name: 'login',
        component: LoginVista,
    },
],
})

export default router