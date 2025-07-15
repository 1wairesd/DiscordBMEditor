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

    <div class="app-content">
      <!-- Tab Navigation -->
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

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- JSON Editor Tab -->
        <div v-if="activeTab === 'json'" class="json-editor-tab">
          <div class="editor-container">
            <div class="editor-header">
              <h2>Редактор команд</h2>
              <div class="editor-actions">
                <button @click="addCommand" class="btn btn-primary">Добавить команду</button>
                <button @click="exportYaml" class="btn btn-secondary">Экспорт YAML</button>
              </div>
            </div>

            <div class="commands-list">
              <div v-for="(command, index) in commands" :key="index" class="command-item">
                <div class="command-header">
                  <h3>{{ command.name || 'Без названия' }}</h3>
                  <div class="command-actions">
                    <button @click="duplicateCommand(index)" class="btn btn-small">Дублировать</button>
                    <button @click="removeCommand(index)" class="btn btn-small btn-danger">Удалить</button>
                  </div>
                </div>

                <div class="command-content">
                  <div class="form-group">
                    <label>Название команды:</label>
                    <input v-model="command.name" type="text" placeholder="Введите название команды" />
                  </div>

                  <div class="form-group">
                    <label>Описание:</label>
                    <textarea v-model="command.description" placeholder="Введите описание команды" rows="2"></textarea>
                  </div>

                  <!-- Options Section -->
                  <div class="section">
                    <h4>Опции</h4>
                    <div class="options-list">
                      <div v-for="(option, optIndex) in command.options" :key="optIndex" class="option-item">
                        <div class="option-header">
                          <input v-model="option.name" placeholder="Название опции" />
                          <button @click="removeOption(command, optIndex)" class="btn btn-small btn-danger">Удалить</button>
                        </div>
                        <div class="option-content">
                          <input v-model="option.description" placeholder="Описание опции" />
                          <select v-model="option.type">
                            <option value="string">Строка</option>
                            <option value="number">Число</option>
                            <option value="boolean">Да/Нет</option>
                            <option value="player">Игрок</option>
                            <option value="world">Мир</option>
                          </select>
                          <label>
                            <input v-model="option.required" type="checkbox" />
                            Обязательная
                          </label>
                        </div>
                      </div>
                      <button @click="addOption(command)" class="btn btn-small">Добавить опцию</button>
                    </div>
                  </div>

                  <!-- Actions Section -->
                  <div class="section">
                    <h4>Действия</h4>
                    <div class="actions-list">
                      <div v-for="(action, actIndex) in command.actions" :key="actIndex" class="action-item">
                        <div class="action-header">
                          <select v-model="action.type">
                            <option value="message">Сообщение</option>
                            <option value="command">Команда</option>
                            <option value="teleport">Телепортация</option>
                            <option value="give">Выдать предмет</option>
                            <option value="effect">Эффект</option>
                            <option value="sound">Звук</option>
                          </select>
                          <button @click="removeAction(command, actIndex)" class="btn btn-small btn-danger">Удалить</button>
                        </div>
                        <div class="action-content">
                          <input v-model="action.message" placeholder="Сообщение" v-if="action.type === 'message'" />
                          <input v-model="action.command" placeholder="Команда" v-if="action.type === 'command'" />
                          <div v-if="action.type === 'teleport'" class="coordinates">
                            <input v-model.number="action.x" type="number" placeholder="X" />
                            <input v-model.number="action.y" type="number" placeholder="Y" />
                            <input v-model.number="action.z" type="number" placeholder="Z" />
                          </div>
                          <div v-if="action.type === 'give'" class="give-item">
                            <input v-model="action.item" placeholder="Предмет" />
                            <input v-model.number="action.amount" type="number" placeholder="Количество" />
                          </div>
                          <input v-model.number="action.delay" type="number" placeholder="Задержка (сек)" />
                        </div>
                      </div>
                      <button @click="addAction(command)" class="btn btn-small">Добавить действие</button>
                    </div>
                  </div>

                  <!-- Conditions Section -->
                  <div class="section">
                    <h4>Условия</h4>
                    <div class="conditions-list">
                      <div v-for="(condition, condIndex) in command.conditions" :key="condIndex" class="condition-item">
                        <div class="condition-header">
                          <select v-model="condition.type">
                            <option value="permission">Права</option>
                            <option value="world">Мир</option>
                            <option value="gamemode">Режим игры</option>
                            <option value="time">Время</option>
                            <option value="weather">Погода</option>
                            <option value="custom">Пользовательское</option>
                          </select>
                          <button @click="removeCondition(command, condIndex)" class="btn btn-small btn-danger">Удалить</button>
                        </div>
                        <div class="condition-content">
                          <input v-model="condition.permission" placeholder="Право" v-if="condition.type === 'permission'" />
                          <input v-model="condition.world" placeholder="Мир" v-if="condition.type === 'world'" />
                          <select v-model="condition.gamemode" v-if="condition.type === 'gamemode'">
                            <option value="SURVIVAL">Выживание</option>
                            <option value="CREATIVE">Творческий</option>
                            <option value="ADVENTURE">Приключения</option>
                            <option value="SPECTATOR">Наблюдатель</option>
                          </select>
                          <select v-model="condition.time" v-if="condition.type === 'time'">
                            <option value="day">День</option>
                            <option value="night">Ночь</option>
                            <option value="morning">Утро</option>
                            <option value="evening">Вечер</option>
                          </select>
                          <select v-model="condition.weather" v-if="condition.type === 'weather'">
                            <option value="clear">Ясно</option>
                            <option value="rain">Дождь</option>
                            <option value="thunder">Гроза</option>
                          </select>
                          <textarea v-model="condition.expression" placeholder="JavaScript выражение" v-if="condition.type === 'custom'" rows="2"></textarea>
                        </div>
                      </div>
                      <button @click="addCondition(command)" class="btn btn-small">Добавить условие</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Visual Editor Tab -->
        <div v-if="activeTab === 'visual'" class="visual-editor-tab">
          <VisualCommandBuilder />
        </div>
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
      bytebinUrl: null
    }
  },
  methods: {
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
  flex-direction: column;
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