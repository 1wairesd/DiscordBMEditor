<template>
  <div class="command-editor">
    <h3>{{ isNew ? 'Создать команду' : 'Редактировать команду' }}</h3>
    <form @submit.prevent="$emit('save', localCommand)">
      <label>Имя команды
        <input v-model="localCommand.name" required />
      </label>
      <label>Описание
        <input v-model="localCommand.description" />
      </label>
      <label>Контекст
        <select v-model="localCommand.context">
          <option value="server">server</option>
          <option value="both">both</option>
        </select>
      </label>
      <label>Ephemeral
        <input type="checkbox" v-model="localCommand.ephemeral" />
      </label>
      <div class="section">
        <h4>Options</h4>
        <button type="button" @click="addOption">+ option</button>
        <ul>
          <li v-for="(opt, i) in localCommand.options" :key="i">
            <input v-model="opt.name" placeholder="name" />
            <input v-model="opt.type" placeholder="type" />
            <input v-model="opt.description" placeholder="description" />
            <input type="checkbox" v-model="opt.required" /> required
            <button type="button" @click="removeOption(i)">🗑️</button>
          </li>
        </ul>
      </div>
      <div class="section">
        <h4>Actions</h4>
        <button type="button" @click="addAction">+ action</button>
        <ul>
          <li v-for="(act, i) in localCommand.actions" :key="i">
            <input v-model="act.type" placeholder="type" />
            <input v-model="act.message" placeholder="message" />
            <button type="button" @click="removeAction(i)">🗑️</button>
          </li>
        </ul>
      </div>
      <div class="section">
        <h4>Conditions</h4>
        <button type="button" @click="addCondition">+ condition</button>
        <ul>
          <li v-for="(cond, i) in localCommand.conditions" :key="i">
            <input v-model="cond.type" placeholder="type" />
            <input v-model="cond.role_id" placeholder="role_id" />
            <button type="button" @click="removeCondition(i)">🗑️</button>
          </li>
        </ul>
      </div>
      <div class="actions">
        <button type="submit">Сохранить</button>
        <button type="button" @click="$emit('cancel')">Отмена</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, toRefs, watch, computed } from 'vue';
const props = defineProps({
  command: Object,
  isNew: Boolean
});
const emit = defineEmits(['save', 'cancel']);
const localCommand = reactive(JSON.parse(JSON.stringify(props.command || {
  name: '', description: '', context: 'server', ephemeral: false,
  options: [], actions: [], conditions: []
})));
watch(() => props.command, (val) => {
  Object.assign(localCommand, JSON.parse(JSON.stringify(val)));
});
function addOption() { localCommand.options.push({ name: '', type: '', description: '', required: false }); }
function removeOption(i) { localCommand.options.splice(i, 1); }
function addAction() { localCommand.actions.push({ type: '', message: '' }); }
function removeAction(i) { localCommand.actions.splice(i, 1); }
function addCondition() { localCommand.conditions.push({ type: '', role_id: '' }); }
function removeCondition(i) { localCommand.conditions.splice(i, 1); }
</script>

<style scoped>
.command-editor {
  background: #23272b;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 24px;
  max-width: 600px;
}
form label {
  display: block;
  margin-bottom: 10px;
  color: #fff;
}
input, select {
  margin-left: 10px;
  margin-bottom: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  background: #181c20;
  color: #fff;
}
.section {
  margin: 16px 0;
}
.actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}
button {
  background: #5865f2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 1rem;
  cursor: pointer;
}
button[type="button"] {
  background: #444;
}
button:hover {
  background: #4752c4;
}
</style> 