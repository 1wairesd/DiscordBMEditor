<template>
  <div id="app">
    <!-- Удалить header-шапку, если есть, чтобы не было дублирования. -->
    <SaveModal v-if="showSaveModal" :bytebin-key="bytebinUrl" @close="showSaveModal = false" />

    <!-- Удалены tab-navigation и все, что связано с JSON редактором -->

    <div class="main-area">
      <div class="visual-editor-tab visual-editor-full">
        <VisualCommandBuilder @save="openSaveModal" />
      </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <span>Готово</span>
      <span v-if="lastSaved">Последнее сохранение: {{ lastSaved }}</span>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue';
import VisualCommandBuilder from './components/VisualCommandBuilder.vue'
import SaveModal from './components/SaveModal.vue'

export default {
  name: 'App',
  components: {
    VisualCommandBuilder,
    SaveModal
  },
  data() {
    return {
      // activeTab: 'json', // Удалено
      commands: [],
      lastSaved: null,
      bytebinUrl: null,
      selectedCommandIndex: null,
      commandRefs: [],
      showSaveModal: false
    }
  },
  methods: {
    openSaveModal() {
      this.saveToBytebin();
      this.showSaveModal = true;
    },
    // selectCommand, addCommand, removeCommand, duplicateCommand, addOption, removeOption, addAction, removeAction, addCondition, removeCondition оставляем если нужны для визуального редактора
    async loadFromBytebin() {
      const code = prompt('Введите код Bytebin:')
      if (!code) return

      try {
        const response = await fetch(`https://bytebin.lucko.me/${code}`)
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные')
        }
        
        const data = await response.json()
        this.commands = data.commands || []
        this.lastSaved = new Date().toLocaleString()
        alert('Данные успешно загружены!')
      } catch (error) {
        console.error('Error loading from Bytebin:', error)
        alert('Ошибка загрузки: ' + error.message)
      }
    },

    async saveToBytebin() {
      try {
        const data = {
          commands: this.commands,
          timestamp: Date.now()
        }

        const response = await fetch('https://bytebin.lucko.me/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          throw new Error('Не удалось сохранить данные')
        }

        const result = await response.json()
        this.bytebinUrl = result.key
        this.lastSaved = new Date().toLocaleString()
        
        // alert удалён
        console.log('Bytebin URL:', this.bytebinUrl)
      } catch (error) {
        console.error('Error saving to Bytebin:', error)
        alert('Ошибка сохранения: ' + error.message)
      }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #1a1a1a;
  color: #ffffff;
  line-height: 1.6;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
}

/* Header */
.app-header {
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
  padding: 1rem 1.5rem;
}

.header-content {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding-right: 2vw;
  padding-left: 2vw;
}

.modern-save {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.btn.modern-save-btn {
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  color: #fff;
  font-size: 1.15rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(59,130,246,0.10);
  padding: 0.7rem 2.2rem;
  transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
  cursor: pointer;
  outline: none;
  min-width: 160px;
}
.btn.modern-save-btn:hover, .btn.modern-save-btn:focus {
  background: linear-gradient(90deg, #2563eb 0%, #059669 100%);
  box-shadow: 0 4px 18px rgba(59,130,246,0.18);
  transform: translateY(-2px) scale(1.03);
}

.app-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e5e7eb;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.main-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}
.visual-editor-tab,
.visual-editor-full {
  flex: 1 1 100%;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Удаляем табы и json-редактор */
.tab-navigation,
.tab-button,
.sidebar,
.json-editor-tab {
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
}

.status-bar {
  background: #2d2d2d;
  border-top: 1px solid #404040;
  padding: 0.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

.btn-lg {
  font-size: 1.25rem;
  padding: 0.75rem 2.5rem;
}

.header-logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
.header-logo-link:hover .header-title {
  text-decoration: underline;
}
.header-logo {
  height: 28px;
  margin-right: 8px;
}
.header-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style> 