<template>
  <div class="layout">
    <aside class="sidebar">
      <h2>{{ $t('editor.title') }}</h2>
      <CommandList
        :commands="commands"
        :selectedIndex="selectedIndex"
        @select="selectCommand"
        @edit="editCommand"
        @delete="deleteCommand"
        @add="addCommand"
        @clone="cloneCommand"
      />
    </aside>
    <main class="main">
      <header class="header">
        <h1>{{ $t('editor.title') }}</h1>
        <div class="header-controls">
          <button class="lang-btn">
            <span class="lang-label">🌐</span>
            <select v-model="lang" @change="changeLang" class="lang-select">
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
          </button>
          <button class="doc-btn" @click="openDoc" title="{{$t('doc.label')}}">
            <img src="/ws-logo.png" alt="doc" class="doc-icon" />
            <span class="doc-label">{{ $t('doc.label') }}</span>
          </button>
        </div>
        <button v-if="commands.length" @click="saveEdits">💾 {{ $t('editor.saveAll') }}</button>
      </header>
      <div v-if="!code">
        <p>{{ $t('editor.openByLink') }} <code>#код</code> (https://your-discordbm-editor.onrender.com/#abcdef123456)</p>
      </div>
      <div v-else-if="loading">
        <p>{{ $t('editor.loading') }}</p>
      </div>
      <div v-else-if="error">
        <p style="color: red">{{ $t('editor.error') }}: {{ error }}</p>
      </div>
      <div v-else>
        <div v-if="editingIndex !== null">
          <CommandEditor
            :command="commands[editingIndex]"
            :isNew="isNewCommand"
            @save="saveCommand"
            @cancel="cancelEdit"
          />
        </div>
        <div v-else-if="selectedIndex !== null">
          <div class="empty-editor">
            <p>{{ $t('editor.selectToEdit') }}</p>
          </div>
        </div>
        <div v-else>
          <div class="empty-editor">
            <p>{{ $t('editor.selectOrCreate') }}</p>
          </div>
        </div>
      </div>
    </main>
    <ModalSaved :visible="showModal" :code="savedCode" @close="showModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import CommandList from './components/CommandList.vue';
import CommandEditor from './components/CommandEditor.vue';
import ModalSaved from './components/ModalSaved.vue';

const { locale } = useI18n();
const lang = ref(locale.value);
function changeLang() {
  locale.value = lang.value;
  localStorage.setItem('language', lang.value);
}
function openDoc() {
  window.open('https://1wairesd.github.io/1wairesdIndustriesWiki/docs/intro', '_blank');
}

const code = window.location.hash.replace('#', '');
const loading = ref(false);
const error = ref('');
const commands = ref([]);
const rawData = ref({});
const saveResult = ref('');
const selectedIndex = ref(null);
const editingIndex = ref(null);
const isNewCommand = ref(false);
const showModal = ref(false);
const savedCode = ref('');

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
    savedCode.value = resp.data.key;
    showModal.value = true;
    saveResult.value = '';
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
.layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 320px;
  background: #202225;
  border-right: 1.5px solid #23272b;
  padding: 24px 12px 12px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sidebar h2 {
  margin: 0 0 12px 8px;
  font-size: 1.2em;
  color: #b9bbbe;
  letter-spacing: 1px;
}
.main {
  flex: 1;
  padding: 32px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.header h1 {
  font-size: 2em;
  font-weight: 700;
  margin: 0;
  color: #fff;
}
.header button {
  background: #5865f2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 16px;
  transition: background 0.2s;
}
.header button:hover {
  background: #4752c4;
}
.empty-editor {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #aaa;
  font-size: 1.2em;
  min-height: 200px;
}
.save-result {
  margin-top: 32px;
  background: #23272b;
  border-radius: 8px;
  padding: 18px 24px;
  color: #fff;
  font-size: 1.1em;
  box-shadow: 0 2px 8px #0004;
}
code {
  background: #111;
  padding: 2px 6px;
  border-radius: 4px;
}
.header-controls {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-right: 18px;
}
.lang-btn {
  display: flex;
  align-items: center;
  background: linear-gradient(145deg, #23272b 60%, #2e3338 100%);
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0003, 0 1.5px 0 #444 inset;
  padding: 0 16px;
  height: 44px;
  font-size: 1.1rem;
  color: #fff;
  cursor: pointer;
  transition: box-shadow 0.2s, background 0.2s;
  position: relative;
}
.lang-btn:hover {
  box-shadow: 0 4px 16px #0005, 0 2px 0 #444 inset;
  background: linear-gradient(145deg, #2e3338 60%, #23272b 100%);
}
.lang-label {
  font-size: 1.3em;
  margin-right: 8px;
}
.lang-select {
  background: transparent;
  color: #fff;
  border: none;
  font-size: 1.1rem;
  outline: none;
  padding: 4px 8px;
  cursor: pointer;
  appearance: none;
}
.doc-btn {
  display: flex;
  align-items: center;
  background: linear-gradient(145deg, #23272b 60%, #2e3338 100%);
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0003, 0 1.5px 0 #444 inset;
  padding: 0 18px 0 10px;
  height: 44px;
  font-size: 1.1rem;
  color: #fff;
  cursor: pointer;
  transition: box-shadow 0.2s, background 0.2s;
  gap: 10px;
}
.doc-btn:hover {
  box-shadow: 0 4px 16px #0005, 0 2px 0 #444 inset;
  background: linear-gradient(145deg, #2e3338 60%, #23272b 100%);
}
.doc-icon {
  width: 28px;
  height: 28px;
  margin-right: 4px;
  filter: drop-shadow(0 1px 2px #0008);
}
.doc-label {
  font-weight: 600;
  font-size: 1.08em;
  letter-spacing: 0.5px;
}
</style> 