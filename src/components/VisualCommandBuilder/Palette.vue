<template>
  <div class="palette">
    <!-- Здесь будут блоки для перетаскивания (опции, действия, условия) -->
    <slot />
  </div>
</template>
<script setup>
</script>
<style scoped>
.palette {
  width: 280px;
  background: #2d2d2d;
  border-right: 1px solid #404040;
  padding: 1rem;
  overflow-y: auto;
  flex-shrink: 0;
}
</style> 