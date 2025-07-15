<template>
  <div class="menu-dropdown" style="position: relative;" ref="menuDropdownRef">
    <button @click="menuOpen = !menuOpen" class="btn btn-info" ref="menuButtonRef">☰ Меню</button>
    <div v-if="menuOpen" class="menu-list">
      <button @click="$emit('save-schema'); menuOpen = false" class="btn btn-primary menu-btn">Сохранить схему</button>
      <button @click="$emit('load-schema'); menuOpen = false" class="btn btn-secondary menu-btn">Загрузить схему</button>
      <button @click="$emit('export-yaml'); menuOpen = false" class="btn btn-success menu-btn">Экспорт YAML</button>
      <button @click="$emit('show-preview'); menuOpen = false" class="btn btn-info menu-btn">👁️ Предпросмотр</button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const menuOpen = ref(false)
const menuDropdownRef = ref(null)
const menuButtonRef = ref(null)
function handleClickOutside(event) {
  if (!menuOpen.value) return;
  const menu = menuDropdownRef.value;
  const btn = menuButtonRef.value;
  if (menu && !menu.contains(event.target) && btn && !btn.contains(event.target)) {
    menuOpen.value = false;
  }
}
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>
<style scoped>
.menu-dropdown {
  display: inline-block;
}
.menu-list {
  position: absolute;
  right: 0;
  top: 110%;
  background: #23272b;
  border: 1px solid #404040;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  z-index: 100;
  min-width: 180px;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.menu-btn {
  width: 100%;
  text-align: left;
  border-radius: 0;
  border: none;
  background: none;
  color: #e5e7eb;
  padding: 10px 18px;
  font-size: 1em;
  transition: background 0.15s;
}
.menu-btn:hover {
  background: #3b82f6;
  color: #fff;
}
</style> 