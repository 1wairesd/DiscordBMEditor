<template>
  <div class="layout">
    <aside class="sidebar">
      <SidebarBlocks />
    </aside>
    <main class="main">
      <header class="header">
        <h1>{{ $t('editor.title') }}</h1>
        <div class="header-controls">
          <div class="lang-dropdown" ref="langDropdownRef">
            <button class="lang-btn" @click="toggleLangMenu">
              <span class="lang-label">🌐</span>
              <span class="lang-short">{{ lang.toUpperCase() }}</span>
              <svg class="lang-arrow" width="16" height="16" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
            </button>
            <transition name="fade">
              <ul v-if="showLangMenu" class="lang-menu">
                <li v-for="l in langList" :key="l.code" :class="{active: l.code === lang}" @click="selectLang(l.code)">
                  {{ $t('langNames.' + l.code) }}
                </li>
              </ul>
            </transition>
          </div>
          <button class="command-menu-btn" @click="toggleCommandMenu" :title="$t('editor.selectCommand')">
            <span>📋</span>
            <span class="command-menu-label">{{ $t('editor.commands') }}</span>
          </button>
          <CommandSelectMenu
            :commands="commands"
            :visible="showCommandMenu"
            @select="selectCommandFromMenu"
          />
          <button class="doc-btn" @click="openDoc" :title="$t('doc.label')">
            <img :src="wsLogo" alt="doc" class="doc-icon" />
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
import wsLogo from './assets/ws-logo.png';
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import CommandList from './components/CommandList.vue';
import CommandEditor from './components/CommandEditor.vue';
import ModalSaved from './components/ModalSaved.vue';
import SidebarBlocks from './components/SidebarBlocks.vue';
import CommandSelectMenu from './components/CommandSelectMenu.vue';

const { locale, t } = useI18n();
const lang = ref(locale.value);
const showLangMenu = ref(false);
const langDropdownRef = ref(null);
const langList = [
  { code: 'en' },
  { code: 'ru' }
];
function toggleLangMenu(e) {
  showLangMenu.value = !showLangMenu.value;
}
function selectLang(code) {
  lang.value = code;
  locale.value = code;
  localStorage.setItem('language', code);
  showLangMenu.value = false;
}
function openDoc() {
  window.open('https://1wairesd.github.io/1wairesdIndustriesWiki/docs/intro', '_blank');
}
function handleClickOutside(event) {
  if (langDropdownRef.value && !langDropdownRef.value.contains(event.target)) {
    showLangMenu.value = false;
  }
}
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

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
const showCommandMenu = ref(false);

function toggleCommandMenu() {
  showCommandMenu.value = !showCommandMenu.value;
}
function selectCommandFromMenu(idx) {
  selectedIndex.value = idx;
  editingIndex.value = null;
  showCommandMenu.value = false;
}

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

<style scoped>
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
.lang-dropdown {
  position: relative;
  display: inline-block;
}
.lang-btn {
  display: flex;
  align-items: center;
  background: linear-gradient(145deg, #23272b 60%, #2e3338 100%);
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0003, 0 1.5px 0 #444 inset;
  padding: 0 18px 0 12px;
  height: 44px;
  font-size: 1.1rem;
  color: #fff;
  cursor: pointer;
  transition: box-shadow 0.2s, background 0.2s;
  position: relative;
  min-width: 70px;
  gap: 8px;
}
.lang-btn:hover, .lang-btn:focus {
  box-shadow: 0 4px 16px #0005, 0 2px 0 #444 inset;
  background: linear-gradient(145deg, #2e3338 60%, #23272b 100%);
}
.lang-label {
  font-size: 1.3em;
}
.lang-short {
  font-weight: 600;
  font-size: 1.08em;
  letter-spacing: 0.5px;
}
.lang-arrow {
  margin-left: 6px;
  transition: transform 0.2s;
}
.lang-menu {
  position: absolute;
  top: 110%;
  left: 0;
  min-width: 170px;
  background: #23272b;
  border-radius: 10px;
  box-shadow: 0 6px 24px #000a;
  padding: 6px 0;
  z-index: 100;
  margin-top: 4px;
  border: 1.5px solid #2e3338;
}
.lang-menu li {
  padding: 10px 18px;
  color: #fff;
  font-size: 1.08em;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  border-radius: 6px;
  margin: 2px 6px;
  text-align: left;
}
.lang-menu li.active, .lang-menu li:hover {
  background: #5865f2;
  color: #fff;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.18s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
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
.command-menu-btn {
  background: #5865f2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.command-menu-btn:hover {
  background: #4752c4;
}
.command-menu-label {
  font-weight: 600;
}
</style> 