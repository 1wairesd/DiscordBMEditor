<template>
  <div class="header">
    <h2>Визуальный редактор команд</h2>
    <div class="header-actions">
      <slot />
    </div>
  </div>
</template>

<script setup>
// Пропсы для undo/redo и события
const props = defineProps({
  canUndo: Boolean,
  canRedo: Boolean
})
const emit = defineEmits(['undo', 'redo'])
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
}
.header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}
.header-actions {
  display: flex;
  gap: 0.75rem;
}
</style> 