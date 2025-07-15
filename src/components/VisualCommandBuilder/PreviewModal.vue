<template>
  <div class="preview-modal">
    <!-- Здесь будет предпросмотр схемы -->
    <slot />
  </div>
</template>
<script setup>
const emit = defineEmits(['close'])
</script>
<style scoped>
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
</style> 