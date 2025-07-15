<template>
  <div class="canvas-container">
    <!-- Здесь будет VueFlow и рабочая область -->
    <slot />
  </div>
</template>
<script setup>
</script>
<style scoped>
.canvas-container {
  flex: 1 1 0%;
  min-width: 0;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
}
</style> 