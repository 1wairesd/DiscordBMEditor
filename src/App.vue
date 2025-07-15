<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <h1>DiscordBM Editor</h1>
        <div class="header-actions">
          <button @click="loadFromBytebin" class="btn btn-primary">Загрузить из Bytebin</button>
          <button @click="saveToBytebin" class="btn btn-success">Сохранить в Bytebin</button>
        </div>
      </div>
    </header>

    <div class="tab-navigation">
      <button 
        @click="activeTab = 'json'" 
        :class="['tab-button', { active: activeTab === 'json' }]"
      >
        JSON Редактор
      </button>
      <button 
        @click="activeTab = 'visual'" 
        :class="['tab-button', { active: activeTab === 'visual' }]"
      >
        Визуальный редактор
      </button>
    </div>

    <div class="main-area">
      <!-- Visual Editor Tab Only -->
      <div class="visual-editor-tab visual-editor-full">
        <VisualCommandBuilder />
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

export default {
  name: 'App',
  components: {
    VisualCommandBuilder
  },
  data() {
    return {
      activeTab: 'json',
      commands: [],
      lastSaved: null,
      bytebinUrl: null,
      selectedCommandIndex: null,
      commandRefs: []
    }
  },
  methods: {
    selectCommand(idx) {
      this.selectedCommandIndex = idx;
      // Прокрутка к выбранной команде
      nextTick(() => {
        const el = this.commandRefs[idx];
        if (el && el.scrollIntoView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    },
    addCommand() {
      this.commands.push({
        name: '',
        description: '',
        options: [],
        actions: [],
        conditions: []
      })
    },

    removeCommand(index) {
      this.commands.splice(index, 1)
    },

    duplicateCommand(index) {
      const command = JSON.parse(JSON.stringify(this.commands[index]))
      command.name = `${command.name} (копия)`
      this.commands.push(command)
    },

    addOption(command) {
      command.options.push({
        name: '',
        description: '',
        type: 'string',
        required: false
      })
    },

    removeOption(command, index) {
      command.options.splice(index, 1)
    },

    addAction(command) {
      command.actions.push({
        type: 'message',
        message: '',
        command: '',
        delay: 0,
        x: 0, y: 0, z: 0,
        item: '',
        amount: 1
      })
    },

    removeAction(command, index) {
      command.actions.splice(index, 1)
    },

    addCondition(command) {
      command.conditions.push({
        type: 'permission',
        permission: '',
        world: '',
        gamemode: 'SURVIVAL',
        time: 'day',
        weather: 'clear',
        expression: ''
      })
    },

    removeCondition(command, index) {
      command.conditions.splice(index, 1)
    },

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
        this.bytebinUrl = `https://bytebin.lucko.me/${result.key}`
        this.lastSaved = new Date().toLocaleString()
        
        alert(`Данные сохранены! Код: ${result.key}`)
        console.log('Bytebin URL:', this.bytebinUrl)
      } catch (error) {
        console.error('Error saving to Bytebin:', error)
        alert('Ошибка сохранения: ' + error.message)
      }
    },

    exportYaml() {
      const data = {
        commands: this.commands
      }
      
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'commands-config.json'
      link.click()
      URL.revokeObjectURL(url)
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
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

/* Content */
.app-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

/* JSON Editor Styles */
.editor-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.editor-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e5e7eb;
}

.editor-actions {
  display: flex;
  gap: 0.75rem;
}

.commands-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.command-item {
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.command-item:hover {
  border-color: #525252;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #404040;
}

.command-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e5e7eb;
}

.command-actions {
  display: flex;
  gap: 0.5rem;
}

.command-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #d1d5db;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.5rem 0.75rem;
  background: #404040;
  border: 1px solid #525252;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.section {
  background: #404040;
  border: 1px solid #525252;
  border-radius: 8px;
  padding: 1rem;
}

.section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 1rem;
}

.options-list,
.actions-list,
.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item,
.action-item,
.condition-item {
  background: #2d2d2d;
  border: 1px solid #525252;
  border-radius: 8px;
  padding: 1rem;
}

.option-header,
.action-header,
.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.option-content,
.action-content,
.condition-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.coordinates,
.give-item {
  display: flex;
  gap: 0.5rem;
}

.coordinates input,
.give-item input {
  flex: 1;
}

/* Status Bar */
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

/* Tab Navigation */
.tab-navigation {
  display: flex;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
}

.tab-button {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: #e5e7eb;
  background: #404040;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #1a1a1a;
}

.tab-content {
  flex: 1;
  overflow: hidden;
}

.json-editor-tab {
  height: 100%;
  overflow-y: auto;
}

.visual-editor-tab {
  height: 100%;
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
.sidebar,
.json-editor-tab {
  display: none !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .editor-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .editor-actions {
    justify-content: center;
  }
  
  
  .command-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .command-actions {
    justify-content: center;
  }
  
  .tab-button {
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
  }
  
  .coordinates,
  .give-item {
    flex-direction: column;
  }
}
</style> 