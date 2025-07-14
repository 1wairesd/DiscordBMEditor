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
      <h2>Команды ({{ commands.length }})</h2>
      <ul>
        <li v-for="(cmd, idx) in commands" :key="idx">
          <b>{{ cmd.name }}</b> — {{ cmd.description }}
        </li>
      </ul>
      <button @click="saveEdits">Сохранить изменения</button>
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

const code = window.location.hash.replace('#', '');
const loading = ref(false);
const error = ref('');
const commands = ref([]);
const rawData = ref({});
const saveResult = ref('');

onMounted(async () => {
  if (!code) return;
  loading.value = true;
  try {
    const resp = await axios.get(`https://bytebin.lucko.me/${code}`);
    rawData.value = resp.data;
    commands.value = Array.isArray(resp.data.commands) ? resp.data.commands : [];
  } catch (e) {
    error.value = e.message || 'Ошибка загрузки данных';
  } finally {
    loading.value = false;
  }
});

async function saveEdits() {
  // Здесь можно добавить логику редактирования rawData.value перед отправкой
  loading.value = true;
  try {
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
  max-width: 700px;
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