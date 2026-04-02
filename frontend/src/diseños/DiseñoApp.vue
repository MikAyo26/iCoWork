<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">

    <!-- Sidebar -->
    <Sidebar />

    <!-- Contenido principal -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '../componentes/Sidebar.vue'
</script>