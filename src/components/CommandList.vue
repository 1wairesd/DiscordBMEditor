<template>
  <div class="command-list">
    <div class="header">
      <h2>Команды ({{ commands.length }})</h2>
      <button @click="$emit('add')">+ Новая команда</button>
      <input v-model="search" placeholder="Поиск..." />
    </div>
    <ul>
      <li v-for="(cmd, idx) in filteredCommands" :key="idx" :class="{selected: idx === selectedIndex}" @click="$emit('select', idx)">
        <b>{{ cmd.name }}</b> <span class="desc">— {{ cmd.description }}</span>
        <button class="edit" @click.stop="$emit('edit', idx)">✏️</button>
        <button class="delete" @click.stop="$emit('delete', idx)">🗑️</button>
        <button class="clone" @click.stop="$emit('clone', idx)">📋</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
const props = defineProps({
  commands: Array,
  selectedIndex: Number
});
const emit = defineEmits(['select', 'edit', 'delete', 'add', 'clone']);
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
.command-list {
  background: #23272b;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 24px;
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.header input {
  flex: 1;
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: #181c20;
  color: #fff;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #3335;
  cursor: pointer;
}
li.selected {
  background: #2c3136;
}
li .desc {
  color: #aaa;
  font-size: 0.95em;
  flex: 1;
}
button.edit, button.delete, button.clone {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.1em;
  cursor: pointer;
  margin-left: 2px;
}
button.edit:hover { color: #ffd700; }
button.delete:hover { color: #ff4d4d; }
button.clone:hover { color: #4dd0ff; }
button {
  transition: color 0.2s;
}
</style> 