<template>
  <div class="command-select-menu" v-if="visible">
    <input v-model="search" placeholder="Поиск команды..." class="search-input" />
    <ul class="command-list">
      <li v-for="(cmd, idx) in filteredCommands" :key="idx" @click="$emit('select', idx)">
        <span class="cmd-name">{{ cmd.name }}</span>
        <span class="cmd-desc">{{ cmd.description }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
const props = defineProps({
  commands: Array,
  visible: Boolean
});
const emit = defineEmits(['select']);
const search = ref('');
const filteredCommands = computed(() => {
  if (!search.value) return props.commands;
  return props.commands.filter(cmd =>
    (cmd.name || '').toLowerCase().includes(search.value.toLowerCase()) ||
    (cmd.description || '').toLowerCase().includes(search.value.toLowerCase())
  );
});
</script>

<style scoped>
.command-select-menu {
  position: absolute;
  top: 48px;
  left: 0;
  background: #23272b;
  border-radius: 10px;
  box-shadow: 0 4px 24px #0008;
  padding: 16px;
  min-width: 260px;
  z-index: 100;
}
.search-input {
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: #181c20;
  color: #fff;
  margin-bottom: 10px;
}
.command-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 320px;
  overflow-y: auto;
}
.command-list li {
  padding: 10px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.command-list li:hover {
  background: #2c3136;
}
.cmd-name {
  font-weight: 700;
  color: #fff;
}
.cmd-desc {
  color: #b9bbbe;
  font-size: 0.97em;
}
</style> 