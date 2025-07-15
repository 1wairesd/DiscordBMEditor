<template>
  <div class="properties-sidebar">
    <!-- Здесь будут свойства выбранного блока -->
    <slot />
  </div>
</template>
<script setup>
</script>
<style scoped>
.properties-sidebar {
  width: 320px;
  background: #2d2d2d;
  border-left: 1px solid #404040;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
</style> 