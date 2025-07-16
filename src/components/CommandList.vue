<template>
  <div class="command-list">
    <div class="header">
      <h2>Команды ({{ commands.length }})</h2>
      <button @click="$emit('add')">+ Новая команда</button>
      <input v-model="search" placeholder="Поиск..." />
    </div>
    <ul>
      <li v-for="(cmd, idx) in filteredCommands" :key="idx" :class="{selected: idx === selectedIndex}" @click="$emit('select', idx)">
        <div class="cmd-main">
          <div class="cmd-name">{{ cmd.name }}</div>
          <div class="cmd-desc">{{ cmd.description }}</div>
        </div>
        <div class="cmd-icons">
          <button class="edit" @click.stop="$emit('edit', idx)">✏️</button>
          <button class="delete" @click.stop="$emit('delete', idx)">🗑️</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
const props = defineProps({
  commands: Array,
  selectedIndex: Number
});
const emit = defineEmits(['select', 'edit', 'delete', 'add']);
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
  gap: 12px;
  padding: 14px 0 10px 0;
  border-bottom: 1px solid #3335;
  cursor: pointer;
  min-height: 48px;
  transition: background 0.15s;
}
li.selected {
  background: #2c3136;
}
.cmd-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
}
.cmd-name {
  font-weight: 700;
  font-size: 1.08em;
  color: #fff;
  margin-bottom: 2px;
  margin-left: 2px;
}
.cmd-desc {
  color: #b9bbbe;
  font-size: 0.97em;
  margin-left: 6px;
  margin-top: 0;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cmd-icons {
  display: flex;
  align-items: center;
  gap: 4px;
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