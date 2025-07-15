<template>
  <div class="visual-command-builder">
    <!-- Header -->
    <div class="header">
      <h2>Визуальный редактор команд</h2>
      <div class="header-actions">
        <button @click="undo" :disabled="!canUndo" class="btn btn-secondary">↶ Отменить</button>
        <button @click="redo" :disabled="!canRedo" class="btn btn-secondary">↷ Повторить</button>
        <button @click="saveSchema" class="btn btn-primary">Сохранить схему</button>
        <button @click="loadSchema" class="btn btn-secondary">Загрузить схему</button>
        <button @click="exportYaml" class="btn btn-success">Экспорт YAML</button>
        <button @click="showPreview = !showPreview" class="btn btn-info">👁️ Предпросмотр</button>
      </div>
    </div>

    <div class="main-content">
      <!-- Palette -->
      <div class="palette">
        <h3>Блоки</h3>
        <div class="palette-section">
          <h4>Опции</h4>
          <div
            v-for="option in availableOptions"
            :key="option.type"
            class="palette-item"
            draggable="true"
            @dragstart="onDragStart($event, option)"
          >
            <div class="palette-item-icon">⚙️</div>
            <div class="palette-item-label">{{ option.label }}</div>
          </div>
        </div>

        <div class="palette-section">
          <h4>Действия</h4>
          <div
            v-for="action in availableActions"
            :key="action.type"
            class="palette-item"
            draggable="true"
            @dragstart="onDragStart($event, action)"
          >
            <div class="palette-item-icon">🎯</div>
            <div class="palette-item-label">{{ action.label }}</div>
          </div>
        </div>

        <div class="palette-section">
          <h4>Условия</h4>
          <div
            v-for="condition in availableConditions"
            :key="condition.type"
            class="palette-item"
            draggable="true"
            @dragstart="onDragStart($event, condition)"
          >
            <div class="palette-item-icon">🔍</div>
            <div class="palette-item-label">{{ condition.label }}</div>
          </div>
        </div>

        <!-- Validation Status -->
        <div class="validation-status">
          <h4>Статус схемы</h4>
          <div v-if="validationErrors.length > 0" class="validation-errors">
            <div v-for="error in validationErrors" :key="error" class="error-item">
              ⚠️ {{ error }}
            </div>
          </div>
          <div v-else class="validation-success">
            ✅ Схема корректна
          </div>
        </div>
      </div>

      <!-- Canvas -->
      <div class="canvas-container">
        <VueFlow
          v-model="elements"
          :default-viewport="{ zoom: 1 }"
          :min-zoom="0.2"
          :max-zoom="4"
          :node-types="nodeTypes"
          :connection-line-style="{ stroke: '#3b82f6', strokeWidth: 2 }"
          :connection-mode="ConnectionMode.Loose"
          class="canvas"
          @node-click="onNodeClick"
          @connect="onConnect"
          @pane-click="onPaneClick"
          @drop="onDrop"
          @dragover.prevent
          @connect-start="onConnectStart"
          @connect-end="onConnectEnd"
        >
          <template #node-custom="props">
            <CustomNode
              :data="props.data"
              :selected="props.selected"
              @update="updateNodeData"
            />
          </template>
        </VueFlow>
      </div>

      <!-- Properties Sidebar -->
      <div v-if="selectedNode" class="properties-sidebar">
        <div class="sidebar-header">
          <h3>Свойства блока</h3>
          <button @click="closeSidebar" class="btn-close">×</button>
        </div>
        
        <div class="sidebar-content">
          <!-- Options Form -->
          <div v-if="selectedNode.data.type === 'option'" class="form-section">
            <h4>Настройки опции</h4>
            
            <div class="form-group">
              <label>Название опции:</label>
              <input 
                v-model="selectedNode.data.name" 
                type="text" 
                placeholder="Введите название опции"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div class="form-group">
              <label>Описание:</label>
              <textarea 
                v-model="selectedNode.data.description" 
                placeholder="Введите описание опции"
                class="form-textarea"
                rows="3"
                @input="saveToHistory"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Тип опции:</label>
              <select v-model="selectedNode.data.optionType" class="form-select" @change="saveToHistory">
                <option value="string">Строка</option>
                <option value="number">Число</option>
                <option value="boolean">Да/Нет</option>
                <option value="player">Игрок</option>
                <option value="world">Мир</option>
              </select>
            </div>

            <div v-if="selectedNode.data.optionType === 'string'" class="form-group">
              <label>Доступные значения (через запятую):</label>
              <input 
                v-model="selectedNode.data.values" 
                type="text" 
                placeholder="значение1, значение2, значение3"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div class="form-group">
              <label>
                <input 
                  v-model="selectedNode.data.required" 
                  type="checkbox" 
                  class="form-checkbox"
                  @change="saveToHistory"
                />
                Обязательная опция
              </label>
            </div>
          </div>

          <!-- Actions Form -->
          <div v-if="selectedNode.data.type === 'action'" class="form-section">
            <h4>Настройки действия</h4>
            
            <div class="form-group">
              <label>Название действия:</label>
              <input 
                v-model="selectedNode.data.name" 
                type="text" 
                placeholder="Введите название действия"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div class="form-group">
              <label>Тип действия:</label>
              <select v-model="selectedNode.data.actionType" class="form-select" @change="saveToHistory">
                <option value="message">Отправить сообщение</option>
                <option value="command">Выполнить команду</option>
                <option value="teleport">Телепортация</option>
                <option value="give">Выдать предмет</option>
                <option value="effect">Эффект</option>
                <option value="sound">Звук</option>
                <option value="economy">Экономика</option>
                <option value="warp">Варп</option>
                <option value="kick">Кик/Бан</option>
                <option value="group">Группа</option>
              </select>
            </div>

            <div v-if="selectedNode.data.actionType === 'message'" class="form-group">
              <label>Сообщение:</label>
              <textarea 
                v-model="selectedNode.data.message" 
                placeholder="Введите сообщение"
                class="form-textarea"
                rows="3"
                @input="saveToHistory"
              ></textarea>
            </div>

            <div v-if="selectedNode.data.actionType === 'command'" class="form-group">
              <label>Команда:</label>
              <input 
                v-model="selectedNode.data.command" 
                type="text" 
                placeholder="Введите команду"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.actionType === 'teleport'" class="form-group">
              <label>Координаты:</label>
              <div class="coordinates-input">
                <input 
                  v-model="selectedNode.data.x" 
                  type="number" 
                  placeholder="X"
                  class="form-input coord-input"
                  @input="saveToHistory"
                />
                <input 
                  v-model="selectedNode.data.y" 
                  type="number" 
                  placeholder="Y"
                  class="form-input coord-input"
                  @input="saveToHistory"
                />
                <input 
                  v-model="selectedNode.data.z" 
                  type="number" 
                  placeholder="Z"
                  class="form-input coord-input"
                  @input="saveToHistory"
                />
              </div>
            </div>

            <div v-if="selectedNode.data.actionType === 'give'" class="form-group">
              <label>Предмет:</label>
              <input 
                v-model="selectedNode.data.item" 
                type="text" 
                placeholder="DIAMOND_SWORD"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Количество:</label>
              <input 
                v-model="selectedNode.data.amount" 
                type="number" 
                placeholder="1"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.actionType === 'effect'" class="form-group">
              <label>Эффект:</label>
              <select v-model="selectedNode.data.effect" class="form-select" @change="saveToHistory">
                <option value="SPEED">Скорость</option>
                <option value="SLOW">Замедление</option>
                <option value="JUMP_BOOST">Прыжок</option>
                <option value="STRENGTH">Сила</option>
                <option value="WEAKNESS">Слабость</option>
                <option value="INVISIBILITY">Невидимость</option>
                <option value="NIGHT_VISION">Ночное зрение</option>
                <option value="REGENERATION">Регенерация</option>
                <option value="POISON">Яд</option>
                <option value="FIRE_RESISTANCE">Огнестойкость</option>
              </select>
              <label>Длительность (сек):</label>
              <input 
                v-model="selectedNode.data.duration" 
                type="number" 
                placeholder="30"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Усиление:</label>
              <input 
                v-model="selectedNode.data.amplifier" 
                type="number" 
                placeholder="1"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.actionType === 'sound'" class="form-group">
              <label>Звук:</label>
              <input 
                v-model="selectedNode.data.sound" 
                type="text" 
                placeholder="entity.player.levelup"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Громкость:</label>
              <input 
                v-model="selectedNode.data.volume" 
                type="number" 
                step="0.1"
                placeholder="1.0"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Тон:</label>
              <input 
                v-model="selectedNode.data.pitch" 
                type="number" 
                step="0.1"
                placeholder="1.0"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.actionType === 'economy'" class="form-group">
              <label>Сумма:</label>
              <input 
                v-model="selectedNode.data.amount" 
                type="number" 
                placeholder="100"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Валюта:</label>
              <select v-model="selectedNode.data.currency" class="form-select" @change="saveToHistory">
                <option value="money">Деньги</option>
                <option value="points">Очки</option>
                <option value="tokens">Токены</option>
              </select>
            </div>

            <div v-if="selectedNode.data.actionType === 'warp'" class="form-group">
              <label>Название варпа:</label>
              <input 
                v-model="selectedNode.data.warpName" 
                type="text" 
                placeholder="spawn"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.actionType === 'kick'" class="form-group">
              <label>Причина:</label>
              <textarea 
                v-model="selectedNode.data.reason" 
                placeholder="Введите причину кика"
                class="form-textarea"
                rows="2"
                @input="saveToHistory"
              ></textarea>
            </div>

            <div v-if="selectedNode.data.actionType === 'ban'" class="form-group">
              <label>Причина:</label>
              <textarea 
                v-model="selectedNode.data.reason" 
                placeholder="Введите причину бана"
                class="form-textarea"
                rows="2"
                @input="saveToHistory"
              ></textarea>
              <label>Длительность (дни):</label>
              <input 
                v-model="selectedNode.data.duration" 
                type="number" 
                placeholder="0 (навсегда)"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.actionType === 'group'" class="form-group">
              <label>Название группы:</label>
              <input 
                v-model="selectedNode.data.groupName" 
                type="text" 
                placeholder="vip"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Действие:</label>
              <select v-model="selectedNode.data.groupAction" class="form-select" @change="saveToHistory">
                <option value="add">Добавить в группу</option>
                <option value="remove">Удалить из группы</option>
                <option value="set">Установить группу</option>
              </select>
            </div>

            <div class="form-group">
              <label>Задержка (сек):</label>
              <input 
                v-model="selectedNode.data.delay" 
                type="number" 
                placeholder="0"
                class="form-input"
                @input="saveToHistory"
              />
            </div>
          </div>

          <!-- Conditions Form -->
          <div v-if="selectedNode.data.type === 'condition'" class="form-section">
            <h4>Настройки условия</h4>
            
            <div class="form-group">
              <label>Название условия:</label>
              <input 
                v-model="selectedNode.data.name" 
                type="text" 
                placeholder="Введите название условия"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div class="form-group">
              <label>Тип условия:</label>
              <select v-model="selectedNode.data.conditionType" class="form-select" @change="saveToHistory">
                <option value="permission">Права</option>
                <option value="world">Мир</option>
                <option value="gamemode">Режим игры</option>
                <option value="time">Время</option>
                <option value="weather">Погода</option>
                <option value="custom">Пользовательское</option>
                <option value="economy">Экономика</option>
                <option value="health">Здоровье</option>
                <option value="experience">Опыт</option>
                <option value="level">Уровень</option>
                <option value="inventory">Инвентарь</option>
              </select>
            </div>

            <div v-if="selectedNode.data.conditionType === 'permission'" class="form-group">
              <label>Право:</label>
              <input 
                v-model="selectedNode.data.permission" 
                type="text" 
                placeholder="example.permission"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.conditionType === 'world'" class="form-group">
              <label>Мир:</label>
              <input 
                v-model="selectedNode.data.world" 
                type="text" 
                placeholder="world"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.conditionType === 'gamemode'" class="form-group">
              <label>Режим игры:</label>
              <select v-model="selectedNode.data.gamemode" class="form-select" @change="saveToHistory">
                <option value="SURVIVAL">Выживание</option>
                <option value="CREATIVE">Творческий</option>
                <option value="ADVENTURE">Приключения</option>
                <option value="SPECTATOR">Наблюдатель</option>
              </select>
            </div>

            <div v-if="selectedNode.data.conditionType === 'time'" class="form-group">
              <label>Время дня:</label>
              <select v-model="selectedNode.data.time" class="form-select" @change="saveToHistory">
                <option value="day">День</option>
                <option value="night">Ночь</option>
                <option value="morning">Утро</option>
                <option value="evening">Вечер</option>
              </select>
            </div>

            <div v-if="selectedNode.data.conditionType === 'weather'" class="form-group">
              <label>Погода:</label>
              <select v-model="selectedNode.data.weather" class="form-select" @change="saveToHistory">
                <option value="clear">Ясно</option>
                <option value="rain">Дождь</option>
                <option value="thunder">Гроза</option>
              </select>
            </div>

            <div v-if="selectedNode.data.conditionType === 'custom'" class="form-group">
              <label>Выражение:</label>
              <textarea 
                v-model="selectedNode.data.expression" 
                placeholder="Введите JavaScript выражение"
                class="form-textarea"
                rows="3"
                @input="saveToHistory"
              ></textarea>
            </div>

            <div v-if="selectedNode.data.conditionType === 'economy'" class="form-group">
              <label>Минимальная сумма:</label>
              <input 
                v-model="selectedNode.data.amount" 
                type="number" 
                placeholder="100"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Валюта:</label>
              <select v-model="selectedNode.data.currency" class="form-select" @change="saveToHistory">
                <option value="money">Деньги</option>
                <option value="points">Очки</option>
                <option value="tokens">Токены</option>
              </select>
            </div>

            <div v-if="selectedNode.data.conditionType === 'health'" class="form-group">
              <label>Минимальное здоровье:</label>
              <input 
                v-model="selectedNode.data.health" 
                type="number" 
                min="0"
                max="20"
                placeholder="10"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.conditionType === 'experience'" class="form-group">
              <label>Минимальный опыт:</label>
              <input 
                v-model="selectedNode.data.experience" 
                type="number" 
                placeholder="100"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.conditionType === 'level'" class="form-group">
              <label>Минимальный уровень:</label>
              <input 
                v-model="selectedNode.data.level" 
                type="number" 
                placeholder="10"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.conditionType === 'inventory'" class="form-group">
              <label>Предмет:</label>
              <input 
                v-model="selectedNode.data.itemName" 
                type="text" 
                placeholder="DIAMOND_SWORD"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Минимальное количество:</label>
              <input 
                v-model="selectedNode.data.itemAmount" 
                type="number" 
                placeholder="1"
                class="form-input"
                @input="saveToHistory"
              />
            </div>
          </div>

          <!-- Common Actions -->
          <div class="form-actions">
            <button @click="deleteNode" class="btn btn-danger">Удалить блок</button>
            <button @click="duplicateNode" class="btn btn-secondary">Дублировать</button>
          </div>
        </div>
      </div>

      <!-- Command Preview Modal -->
      <div v-if="showPreview" class="preview-modal">
        <div class="preview-content">
          <div class="preview-header">
            <h3>Предпросмотр команды</h3>
            <button @click="showPreview = false" class="btn-close">×</button>
          </div>
          <div class="preview-body">
            <div class="preview-tabs">
              <button 
                @click="previewTab = 'yaml'" 
                :class="['preview-tab', { active: previewTab === 'yaml' }]"
              >
                YAML
              </button>
              <button 
                @click="previewTab = 'json'" 
                :class="['preview-tab', { active: previewTab === 'json' }]"
              >
                JSON
              </button>
            </div>
            <div class="preview-code">
              <pre v-if="previewTab === 'yaml'">{{ yamlPreview }}</pre>
              <pre v-else>{{ jsonPreview }}</pre>
            </div>
            <div class="preview-actions">
              <button @click="copyPreview" class="btn btn-primary">Копировать</button>
              <button @click="downloadPreview" class="btn btn-secondary">Скачать</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { VueFlow, ConnectionMode } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import CustomNode from './CustomNode.vue'

// Register custom node type
const nodeTypes = {
  custom: CustomNode
}

// Available blocks for palette
const availableOptions = ref([
  { type: 'option', label: 'Опция', icon: '⚙️' },
  { type: 'option', label: 'Числовая опция', icon: '🔢' },
  { type: 'option', label: 'Логическая опция', icon: '✅' },
  { type: 'option', label: 'Опция игрока', icon: '👤' },
  { type: 'option', label: 'Опция мира', icon: '🌍' }
])

const availableActions = ref([
  { type: 'action', label: 'Сообщение', icon: '💬' },
  { type: 'action', label: 'Команда', icon: '⚡' },
  { type: 'action', label: 'Телепорт', icon: '🚀' },
  { type: 'action', label: 'Выдать предмет', icon: '🎁' },
  { type: 'action', label: 'Эффект', icon: '✨' },
  { type: 'action', label: 'Звук', icon: '🔊' },
  { type: 'action', label: 'Экономика', icon: '💰' },
  { type: 'action', label: 'Варп', icon: '📍' },
  { type: 'action', label: 'Кик/Бан', icon: '🚫' },
  { type: 'action', label: 'Группа', icon: '👥' }
])

const availableConditions = ref([
  { type: 'condition', label: 'Права', icon: '🔐' },
  { type: 'condition', label: 'Мир', icon: '🌍' },
  { type: 'condition', label: 'Режим игры', icon: '🎮' },
  { type: 'condition', label: 'Время', icon: '⏰' },
  { type: 'condition', label: 'Погода', icon: '🌤️' },
  { type: 'condition', label: 'Экономика', icon: '💰' },
  { type: 'condition', label: 'Здоровье', icon: '❤️' },
  { type: 'condition', label: 'Опыт', icon: '⭐' },
  { type: 'condition', label: 'Инвентарь', icon: '🎒' },
  { type: 'condition', label: 'Пользовательское', icon: '🔧' }
])

// Vue Flow elements
const elements = ref([])
const selectedNode = ref(null)
const showPreview = ref(false)
const previewTab = ref('yaml')

// History for undo/redo
const history = ref([])
const historyIndex = ref(-1)
const maxHistorySize = 50

// Connection validation
const connectionStart = ref(null)
const validationErrors = ref([])

// Node counter for unique IDs
let nodeIdCounter = 1

// Computed properties
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const yamlPreview = computed(() => {
  const data = convertFlowToYaml(elements.value)
  return JSON.stringify(data, null, 2)
})

const jsonPreview = computed(() => {
  return JSON.stringify(elements.value, null, 2)
})

// Validation rules for connections
const connectionRules = {
  option: ['action', 'condition'],
  action: ['action', 'condition'],
  condition: ['action']
}

// Watch for changes and save to history
watch(elements, () => {
  validateSchema()
}, { deep: true })

// Drag and drop handlers
const onDragStart = (event, block) => {
  event.dataTransfer.setData('application/vueflow', JSON.stringify(block))
  event.dataTransfer.effectAllowed = 'move'
}

const onDrop = (event) => {
  const blockData = JSON.parse(event.dataTransfer.getData('application/vueflow'))
  
  // Get the canvas element to calculate position
  const canvas = event.target.closest('.vue-flow__viewport')
  const rect = canvas.getBoundingClientRect()
  
  // Calculate position relative to the canvas
  const position = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  
  const newNode = {
    id: `node-${nodeIdCounter++}`,
    type: 'custom',
    position,
    data: {
      type: blockData.type,
      name: `Новый ${blockData.label}`,
      description: '',
      ...getDefaultDataForType(blockData.type)
    }
  }
  
  elements.value.push(newNode)
  saveToHistory()
}

const getDefaultDataForType = (type) => {
  switch (type) {
    case 'option':
      return {
        optionType: 'string',
        values: '',
        required: false
      }
    case 'action':
      return {
        actionType: 'message',
        message: '',
        command: '',
        delay: 0,
        x: 0, y: 0, z: 0,
        item: '',
        amount: 1,
        effect: '',
        duration: 30,
        amplifier: 1,
        sound: '',
        volume: 1.0,
        pitch: 1.0,
        amount: 0,
        currency: 'money',
        warpName: '',
        reason: '',
        duration: 0,
        groupName: '',
        permission: '',
        groupAction: 'add' // Added for new action types
      }
    case 'condition':
      return {
        conditionType: 'permission',
        permission: '',
        world: '',
        gamemode: 'SURVIVAL',
        time: 'day',
        weather: 'clear',
        expression: '',
        amount: 0,
        currency: 'money',
        health: 20,
        experience: 0,
        level: 0,
        itemName: '',
        itemAmount: 1
      }
    default:
      return {}
  }
}

// Node interaction handlers
const onNodeClick = (event, node) => {
  selectedNode.value = node
}

const onPaneClick = () => {
  selectedNode.value = null
}

const onConnectStart = (event, params) => {
  connectionStart.value = params.node
}

const onConnectEnd = () => {
  connectionStart.value = null
}

const onConnect = (params) => {
  // Validate connection
  const sourceNode = elements.value.find(el => el.id === params.source)
  const targetNode = elements.value.find(el => el.id === params.target)
  
  if (sourceNode && targetNode) {
    const sourceType = sourceNode.data.type
    const targetType = targetNode.data.type
    
    if (connectionRules[sourceType] && connectionRules[sourceType].includes(targetType)) {
      const newEdge = {
        id: `edge-${Date.now()}`,
        source: params.source,
        target: params.target,
        type: 'smoothstep',
        style: { stroke: '#3b82f6', strokeWidth: 2 }
      }
      elements.value.push(newEdge)
      saveToHistory()
    } else {
      alert(`Нельзя соединить ${sourceType} с ${targetType}`)
    }
  }
}

// Sidebar handlers
const closeSidebar = () => {
  selectedNode.value = null
}

const updateNodeData = (nodeId, newData) => {
  const node = elements.value.find(el => el.id === nodeId)
  if (node) {
    node.data = { ...node.data, ...newData }
  }
}

const deleteNode = () => {
  if (selectedNode.value) {
    // Remove the node and all connected edges
    elements.value = elements.value.filter(el => 
      el.id !== selectedNode.value.id && 
      (el.source !== selectedNode.value.id && el.target !== selectedNode.value.id)
    )
    selectedNode.value = null
    saveToHistory()
  }
}

const duplicateNode = () => {
  if (selectedNode.value) {
    const originalNode = selectedNode.value
    const newNode = {
      id: `node-${nodeIdCounter++}`,
      type: 'custom',
      position: {
        x: originalNode.position.x + 200,
        y: originalNode.position.y + 100
      },
      data: {
        ...originalNode.data,
        name: `${originalNode.data.name} (копия)`
      }
    }
    elements.value.push(newNode)
    selectedNode.value = newNode
    saveToHistory()
  }
}

// History management
const saveToHistory = () => {
  const currentState = JSON.parse(JSON.stringify(elements.value))
  
  // Remove future history if we're not at the end
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  
  // Add current state
  history.value.push(currentState)
  historyIndex.value = history.value.length - 1
  
  // Limit history size
  if (history.value.length > maxHistorySize) {
    history.value.shift()
    historyIndex.value--
  }
}

const undo = () => {
  if (canUndo.value) {
    historyIndex.value--
    elements.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
  }
}

const redo = () => {
  if (canRedo.value) {
    historyIndex.value++
    elements.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
  }
}

// Validation
const validateSchema = () => {
  const errors = []
  const nodes = elements.value.filter(el => el.type === 'custom')
  const edges = elements.value.filter(el => el.source && el.target)
  
  // Check for disconnected nodes
  const connectedNodes = new Set()
  edges.forEach(edge => {
    connectedNodes.add(edge.source)
    connectedNodes.add(edge.target)
  })
  
  nodes.forEach(node => {
    if (!connectedNodes.has(node.id)) {
      errors.push(`Блок "${node.data.name}" не соединен`)
    }
  })
  
  // Check for required fields
  nodes.forEach(node => {
    if (!node.data.name || node.data.name.trim() === '') {
      errors.push(`Блок "${node.id}" не имеет названия`)
    }
  })
  
  // Check for circular connections
  if (hasCircularConnections(edges)) {
    errors.push('Обнаружены циклические соединения')
  }
  
  validationErrors.value = errors
}

const hasCircularConnections = (edges) => {
  const graph = {}
  edges.forEach(edge => {
    if (!graph[edge.source]) graph[edge.source] = []
    graph[edge.source].push(edge.target)
  })
  
  const visited = new Set()
  const recursionStack = new Set()
  
  const dfs = (node) => {
    if (recursionStack.has(node)) return true
    if (visited.has(node)) return false
    
    visited.add(node)
    recursionStack.add(node)
    
    if (graph[node]) {
      for (const neighbor of graph[node]) {
        if (dfs(neighbor)) return true
      }
    }
    
    recursionStack.delete(node)
    return false
  }
  
  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      if (dfs(node)) return true
    }
  }
  
  return false
}

// Save/Load functionality
const saveSchema = () => {
  const schema = {
    elements: elements.value,
    timestamp: Date.now()
  }
  const dataStr = JSON.stringify(schema, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'command-schema.json'
  link.click()
  URL.revokeObjectURL(url)
}

const loadSchema = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const schema = JSON.parse(e.target.result)
          elements.value = schema.elements || []
          nodeIdCounter = Math.max(...elements.value.map(el => 
            parseInt(el.id.replace('node-', '')) || 0
          )) + 1
          saveToHistory()
        } catch (error) {
          console.error('Error loading schema:', error)
          alert('Ошибка загрузки схемы')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const exportYaml = () => {
  const yamlData = convertFlowToYaml(elements.value)
  const dataStr = JSON.stringify(yamlData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'command-config.json'
  link.click()
  URL.revokeObjectURL(url)
}

const convertFlowToYaml = (elements) => {
  const nodes = elements.filter(el => el.type === 'custom')
  const edges = elements.filter(el => el.source && el.target)
  
  // Build command structure from nodes and edges
  const commands = {}
  
  // Process options
  const optionNodes = nodes.filter(n => n.data.type === 'option')
  if (optionNodes.length > 0) {
    commands.options = {}
    optionNodes.forEach(node => {
      commands.options[node.data.name] = {
        description: node.data.description,
        type: node.data.optionType,
        required: node.data.required
      }
      if (node.data.values) {
        commands.options[node.data.name].values = node.data.values.split(',').map(v => v.trim())
      }
    })
  }
  
  // Process actions and conditions
  const actionNodes = nodes.filter(n => n.data.type === 'action')
  const conditionNodes = nodes.filter(n => n.data.type === 'condition')
  
  if (actionNodes.length > 0) {
    commands.actions = actionNodes.map(action => {
      const actionData = {
        type: action.data.actionType,
        name: action.data.name,
        delay: action.data.delay || 0
      }
      
      // Add type-specific properties
      switch (action.data.actionType) {
        case 'message':
          actionData.message = action.data.message
          break
        case 'command':
          actionData.command = action.data.command
          break
        case 'teleport':
          actionData.x = action.data.x
          actionData.y = action.data.y
          actionData.z = action.data.z
          break
        case 'give':
          actionData.item = action.data.item
          actionData.amount = action.data.amount
          break
        case 'effect':
          actionData.effect = action.data.effect
          actionData.duration = action.data.duration
          actionData.amplifier = action.data.amplifier
          break
        case 'sound':
          actionData.sound = action.data.sound
          actionData.volume = action.data.volume
          actionData.pitch = action.data.pitch
          break
        case 'economy':
          actionData.amount = action.data.amount
          actionData.currency = action.data.currency
          break
        case 'warp':
          actionData.warpName = action.data.warpName
          break
        case 'kick':
        case 'ban':
          actionData.reason = action.data.reason
          if (action.data.actionType === 'ban') {
            actionData.duration = action.data.duration
          }
          break
        case 'group':
          actionData.groupName = action.data.groupName
          actionData.groupAction = action.data.groupAction
          break
      }
      
      return actionData
    })
  }
  
  if (conditionNodes.length > 0) {
    commands.conditions = conditionNodes.map(condition => {
      const conditionData = {
        type: condition.data.conditionType,
        name: condition.data.name
      }
      
      // Add type-specific properties
      switch (condition.data.conditionType) {
        case 'permission':
          conditionData.permission = condition.data.permission
          break
        case 'world':
          conditionData.world = condition.data.world
          break
        case 'gamemode':
          conditionData.gamemode = condition.data.gamemode
          break
        case 'time':
          conditionData.time = condition.data.time
          break
        case 'weather':
          conditionData.weather = condition.data.weather
          break
        case 'custom':
          conditionData.expression = condition.data.expression
          break
        case 'economy':
          conditionData.amount = condition.data.amount
          conditionData.currency = condition.data.currency
          break
        case 'health':
          conditionData.health = condition.data.health
          break
        case 'experience':
          conditionData.experience = condition.data.experience
          break
        case 'level':
          conditionData.level = condition.data.level
          break
        case 'inventory':
          conditionData.itemName = condition.data.itemName
          conditionData.itemAmount = condition.data.itemAmount
          break
      }
      
      return conditionData
    })
  }
  
  return commands
}

// Preview functionality
const copyPreview = () => {
  const text = previewTab.value === 'yaml' ? yamlPreview.value : jsonPreview.value
  navigator.clipboard.writeText(text).then(() => {
    alert('Скопировано в буфер обмена!')
  })
}

const downloadPreview = () => {
  const text = previewTab.value === 'yaml' ? yamlPreview.value : jsonPreview.value
  const extension = previewTab.value === 'yaml' ? 'json' : 'json'
  const dataBlob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `command-preview.${extension}`
  link.click()
  URL.revokeObjectURL(url)
}

// Initialize history
saveToHistory()
</script>

<style scoped>
.visual-command-builder {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: #ffffff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
}

.header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
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

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.palette {
  width: 280px;
  background: #2d2d2d;
  border-right: 1px solid #404040;
  padding: 1rem;
  overflow-y: auto;
}

.palette h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e5e7eb;
}

.palette-section {
  margin-bottom: 1.5rem;
}

.palette-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #404040;
  border: 1px solid #525252;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
}

.palette-item:hover {
  background: #525252;
  border-color: #6b7280;
  transform: translateY(-1px);
}

.palette-item:active {
  cursor: grabbing;
}

.palette-item-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.palette-item-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #e5e7eb;
}

.canvas-container {
  flex: 1;
  position: relative;
}

.canvas {
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
}

.properties-sidebar {
  width: 320px;
  background: #2d2d2d;
  border-left: 1px solid #404040;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #404040;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e5e7eb;
}

.btn-close {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: #404040;
  color: #e5e7eb;
}

.sidebar-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #e5e7eb;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #d1d5db;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: #404040;
  border: 1px solid #525252;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.coordinates-input {
  display: flex;
  gap: 0.5rem;
}

.coord-input {
  flex: 1;
}

.form-checkbox {
  margin-right: 0.5rem;
  width: auto;
}

.form-actions {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #404040;
  display: flex;
  gap: 0.75rem;
}

.form-actions .btn {
  flex: 1;
}

/* Vue Flow customizations */
:deep(.vue-flow__node) {
  border-radius: 8px;
  border: 2px solid #525252;
  background: #404040;
  color: #e5e7eb;
}

:deep(.vue-flow__node.selected) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

:deep(.vue-flow__edge) {
  stroke: #6b7280;
  stroke-width: 2;
}

:deep(.vue-flow__edge.selected) {
  stroke: #3b82f6;
  stroke-width: 3;
}

:deep(.vue-flow__controls) {
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 8px;
}

:deep(.vue-flow__controls button) {
  background: #404040;
  border: 1px solid #525252;
  color: #e5e7eb;
}

:deep(.vue-flow__controls button:hover) {
  background: #525252;
}

:deep(.vue-flow__minimap) {
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 8px;
}

:deep(.vue-flow__background) {
  background-color: #1a1a1a;
}

/* Validation Status */
.validation-status {
  margin-top: 2rem;
  padding: 1rem;
  background: #404040;
  border: 1px solid #525252;
  border-radius: 8px;
}

.validation-status h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e5e7eb;
}

.validation-errors {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-item {
  font-size: 0.75rem;
  color: #fca5a5;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
}

.validation-success {
  font-size: 0.75rem;
  color: #86efac;
  padding: 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 4px;
}

/* Preview Modal */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #404040;
}

.preview-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e5e7eb;
}

.preview-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-tabs {
  display: flex;
  border-bottom: 1px solid #404040;
}

.preview-tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.preview-tab:hover {
  color: #e5e7eb;
  background: #404040;
}

.preview-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #1a1a1a;
}

.preview-code {
  flex: 1;
  padding: 1rem;
  overflow: auto;
  background: #1a1a1a;
}

.preview-code pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #e5e7eb;
  white-space: pre-wrap;
  word-break: break-word;
}

.preview-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #404040;
  justify-content: flex-end;
}

/* Button styles */
.btn-info {
  background: #0ea5e9;
  color: white;
}

.btn-info:hover {
  background: #0284c7;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:disabled:hover {
  background: inherit;
}

/* Connection validation styles */
:deep(.vue-flow__edge) {
  transition: all 0.2s ease;
}

:deep(.vue-flow__edge.valid) {
  stroke: #10b981;
  stroke-width: 3;
}

:deep(.vue-flow__edge.invalid) {
  stroke: #ef4444;
  stroke-width: 3;
  stroke-dasharray: 5,5;
}

/* Node validation styles */
:deep(.vue-flow__node.error) {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

:deep(.vue-flow__node.warning) {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .preview-content {
    width: 95%;
    max-height: 90vh;
  }
  
  .preview-tab {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
  
  .preview-actions {
    flex-direction: column;
  }
  
  .validation-status {
    margin-top: 1rem;
  }
}
</style> 