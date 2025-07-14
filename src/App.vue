<template>
  <main class="editor">
    <h1>DiscordBM Editor</h1>
    <div v-if="!code">
      <p>Откройте редактор по ссылке вида <code>#код</code> (например, https://your-discordbm-editor.onrender.com/#abcdef123456)</p>
    </div>
    <div v-else-if="loading">
      <p>Загрузка данных...</p>
    </div>
    <div v-else-if="error">
      <p style="color: red">Ошибка: {{ error }}</p>
    </div>
    <div v-else>
      <CommandList
        :commands="commands"
        :selectedIndex="selectedIndex"
        @select="selectCommand"
        @edit="editCommand"
        @delete="deleteCommand"
        @add="addCommand"
        @clone="cloneCommand"
      />
      <CommandEditor
        v-if="editingIndex !== null"
        :command="commands[editingIndex]"
        :isNew="isNewCommand"
        @save="saveCommand"
        @cancel="cancelEdit"
      />
      <button @click="saveEdits">Сохранить все изменения</button>
      <div v-if="saveResult">
        <p>Скопируйте команду для применения изменений:</p>
        <code>/discordbmv applyedits {{ saveResult }}</code>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CommandList from './components/CommandList.vue';
import CommandEditor from './components/CommandEditor.vue';

const code = window.location.hash.replace('#', '');
const loading = ref(false);
const error = ref('');
const commands = ref([]);
const rawData = ref({});
const saveResult = ref('');
const selectedIndex = ref(null);
const editingIndex = ref(null);
const isNewCommand = ref(false);

onMounted(async () => {
  if (!code) return;
  loading.value = true;
  try {
    const resp = await axios.get(`https://bytebin.lucko.me/${code}`);
    let data = resp.data;
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    rawData.value = data;
    commands.value = Array.isArray(data.commands) ? data.commands : [];
  } catch (e) {
    error.value = e.message || 'Ошибка загрузки данных';
  } finally {
    loading.value = false;
  }
});

function selectCommand(idx) {
  selectedIndex.value = idx;
  editingIndex.value = null;
}
function editCommand(idx) {
  editingIndex.value = idx;
  isNewCommand.value = false;
}
function addCommand() {
  commands.value.push({
    name: '', description: '', context: 'server', ephemeral: false,
    options: [], actions: [], conditions: []
  });
  editingIndex.value = commands.value.length - 1;
  isNewCommand.value = true;
}
function cloneCommand(idx) {
  const clone = JSON.parse(JSON.stringify(commands.value[idx]));
  clone.name = clone.name + '_copy';
  commands.value.splice(idx + 1, 0, clone);
}
function deleteCommand(idx) {
  if (confirm('Удалить команду?')) {
    commands.value.splice(idx, 1);
    if (editingIndex.value === idx) editingIndex.value = null;
  }
}
function saveCommand(cmd) {
  commands.value[editingIndex.value] = JSON.parse(JSON.stringify(cmd));
  editingIndex.value = null;
  isNewCommand.value = false;
}
function cancelEdit() {
  if (isNewCommand.value) {
    commands.value.pop();
  }
  editingIndex.value = null;
  isNewCommand.value = false;
}
async function saveEdits() {
  loading.value = true;
  try {
    rawData.value.commands = commands.value;
    const resp = await axios.post('https://bytebin.lucko.me/post', rawData.value, {
      headers: { 'Content-Type': 'application/json' }
    });
    saveResult.value = resp.data.key;
  } catch (e) {
    error.value = e.message || 'Ошибка сохранения';
  } finally {
    loading.value = false;
  }
}
</script>

<style>
body {
  font-family: system-ui, sans-serif;
  background: #181c20;
  color: #fff;
  margin: 0;
}
.editor {
  max-width: 900px;
  margin: 40px auto;
  background: #23272b;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 16px #0008;
}
button {
  background: #5865f2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 16px;
}
button:hover {
  background: #4752c4;
}
code {
  background: #111;
  padding: 2px 6px;
  border-radius: 4px;
}
</style> 