<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from '../componentes/Sidebar.vue'
import { useSocket } from '../composiciones/useSocket'

const { conectar, desconectar } = useSocket()

/** Conecta el WebSocket al montar el layout principal */
onMounted(() => {
  conectar()
})

/** Desconecta el WebSocket al desmontar el layout principal */
onUnmounted(() => {
  desconectar()
})
</script>