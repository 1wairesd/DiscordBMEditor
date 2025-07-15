<template>
  <div class="validation-status">
    <!-- Здесь будет статус валидации -->
    <slot />
  </div>
</template>
<script setup>
</script>
<style scoped>
.validation-status {
  margin-top: 2rem;
  padding: 1rem;
  background: #404040;
  border: 1px solid #525252;
  border-radius: 8px;
}
</style> 