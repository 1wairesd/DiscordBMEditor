<template>
  <div class="visual-command-builder">
    <!-- Header -->
    <div class="header">
      <h2>Визуальный редактор команд</h2>
      <div class="header-actions">
        <button @click="undo" :disabled="!canUndo" class="btn btn-secondary">↶ Отменить</button>
        <button @click="redo" :disabled="!canRedo" class="btn btn-secondary">↷ Повторить</button>
        <!-- Меню управления -->
        <div class="menu-dropdown" style="position: relative;">
          <button @click="menuOpen = !menuOpen" class="btn btn-info">☰ Меню</button>
          <div v-if="menuOpen" class="menu-list">
            <button @click="saveSchema; menuOpen = false" class="btn btn-primary menu-btn">Сохранить схему</button>
            <button @click="loadSchema; menuOpen = false" class="btn btn-secondary menu-btn">Загрузить схему</button>
            <button @click="exportYaml; menuOpen = false" class="btn btn-success menu-btn">Экспорт YAML</button>
            <button @click="showPreview = true; menuOpen = false" class="btn btn-info menu-btn">👁️ Предпросмотр</button>
          </div>
        </div>
      </div>
    </div>


    <div class="main-content">
      <!-- Palette -->
      <div class="palette">
        <h3>Блоки</h3>
        <div class="palette-tabs">
          <button :class="['palette-tab', {active: paletteTab==='options'}]" @click="paletteTab='options'">Опции</button>
          <button :class="['palette-tab', {active: paletteTab==='actions'}]" @click="paletteTab='actions'">Действия</button>
          <button :class="['palette-tab', {active: paletteTab==='conditions'}]" @click="paletteTab='conditions'">Условия</button>
        </div>
        <div class="palette-scroll">
          <template v-if="paletteTab==='options'">
        <div class="palette-section">
          <h4>Опции</h4>
              <div v-for="option in availableOptions" :key="option.type" class="palette-item" draggable="true" @dragstart="onDragStart($event, option)">
            <div class="palette-item-icon">{{ option.icon }}</div>
            <div class="palette-item-label">{{ option.label }}</div>
          </div>
        </div>
          </template>
          <template v-else-if="paletteTab==='actions'">
        <div class="palette-section">
          <h4>Действия</h4>
              <div v-for="action in availableActions" :key="action.type" class="palette-item" draggable="true" @dragstart="onDragStart($event, action)">
            <div class="palette-item-icon">{{ action.icon }}</div>
            <div class="palette-item-label">{{ action.label }}</div>
          </div>
        </div>
          </template>
          <template v-else>
        <div class="palette-section">
          <h4>Условия</h4>
              <div v-for="condition in availableConditions" :key="condition.type" class="palette-item" draggable="true" @dragstart="onDragStart($event, condition)">
            <div class="palette-item-icon">{{ condition.icon }}</div>
            <div class="palette-item-label">{{ condition.label }}</div>
          </div>
        </div>
          </template>
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
              @delete="() => handleNodeDelete(props.id)"
              @select="() => handleNodeSelect(props.id)"
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
                <option value="STRING">Строка (STRING)</option>
                <option value="USER">Пользователь (USER)</option>
                <option value="CHANNEL">Канал (CHANNEL)</option>
              </select>
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
                <option value="send_message">Отправить сообщение</option>
                <option value="send_to_channel">Отправить в канал</option>
                <option value="delete_message">Удалить сообщение</option>
                <option value="button">Кнопка</option>
                <option value="edit_component">Редактировать компонент</option>
                <option value="send_form">Форма</option>
                <option value="add_role">Добавить роль</option>
                <option value="resolve_placeholders">Разрешить плейсхолдеры</option>
                <option value="send_page">Отправить страницу</option>
              </select>
            </div>

            <div v-if="selectedNode.data.actionType === 'send_message'" class="form-group">
              <label>Сообщение:</label>
              <textarea 
                v-model="selectedNode.data.message" 
                placeholder="Введите сообщение"
                class="form-textarea"
                rows="3"
                @input="saveToHistory"
              ></textarea>
              <label>Тип ответа:</label>
              <select v-model="selectedNode.data.response_type" class="form-select" @change="saveToHistory">
                <option value="REPLY">Ответ (REPLY)</option>
                <option value="edit_message">Редактировать сообщение</option>
              </select>
              <label>Метка:</label>
              <input 
                v-model="selectedNode.data.label" 
                type="text" 
                placeholder="Метка для ссылки"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.actionType === 'send_to_channel'" class="form-group">
              <label>Сообщение:</label>
              <textarea 
                v-model="selectedNode.data.message" 
                placeholder="Введите сообщение"
                class="form-textarea"
                rows="3"
                @input="saveToHistory"
              ></textarea>
              <label>Метка:</label>
              <input 
                v-model="selectedNode.data.label" 
                type="text" 
                placeholder="Метка для ссылки"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.actionType === 'delete_message'" class="form-group">
              <label>Метка:</label>
              <input 
                v-model="selectedNode.data.label" 
                type="text" 
                placeholder="Метка сообщения для удаления"
                class="form-input"
                @input="saveToHistory"
              />
              <label>
                <input 
                  v-model="selectedNode.data.delete_all" 
                  type="checkbox" 
                  class="form-checkbox"
                  @change="saveToHistory"
                />
                Удалить все
              </label>
              <label>Сообщение об удалении:</label>
              <input 
                v-model="selectedNode.data.response_message" 
                type="text" 
                placeholder="Сообщение после удаления"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.actionType === 'button'" class="form-group">
              <label>Текст кнопки:</label>
              <input 
                v-model="selectedNode.data.button_label" 
                type="text" 
                placeholder="Текст кнопки"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Стиль кнопки:</label>
              <select v-model="selectedNode.data.button_style" class="form-select" @change="saveToHistory">
                <option value="PRIMARY">Основная (PRIMARY)</option>
                <option value="SECONDARY">Вторичная (SECONDARY)</option>
                <option value="SUCCESS">Успех (SUCCESS)</option>
                <option value="DANGER">Опасность (DANGER)</option>
                <option value="LINK">Ссылка (LINK)</option>
              </select>
              <label>URL (для LINK):</label>
              <input 
                v-model="selectedNode.data.button_url" 
                type="text" 
                placeholder="https://example.com"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Эмодзи:</label>
              <input 
                v-model="selectedNode.data.button_emoji" 
                type="text" 
                placeholder="🔗"
                class="form-input"
                @input="saveToHistory"
              />
              <label>ID кнопки:</label>
              <input 
                v-model="selectedNode.data.button_id" 
                type="text" 
                placeholder="btn_click"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Сообщение кнопки:</label>
              <input 
                v-model="selectedNode.data.button_message" 
                type="text" 
                placeholder="Сообщение при нажатии"
                class="form-input"
                @input="saveToHistory"
              />
              <label>
                <input 
                  v-model="selectedNode.data.button_disabled" 
                  type="checkbox" 
                  class="form-checkbox"
                  @change="saveToHistory"
                />
                Отключена
              </label>
            </div>

            <div v-if="selectedNode.data.actionType === 'edit_component'" class="form-group">
              <label>Целевое сообщение:</label>
              <input 
                v-model="selectedNode.data.target_message" 
                type="text" 
                placeholder="Метка сообщения"
                class="form-input"
                @input="saveToHistory"
              />
              <label>ID компонента:</label>
              <input 
                v-model="selectedNode.data.component_id" 
                type="text" 
                placeholder="btn_click"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Новый текст:</label>
              <input 
                v-model="selectedNode.data.button_label" 
                type="text" 
                placeholder="Новый текст кнопки"
                class="form-input"
                @input="saveToHistory"
              />
              <label>Новый стиль:</label>
              <select v-model="selectedNode.data.button_style" class="form-select" @change="saveToHistory">
                <option value="PRIMARY">Основная (PRIMARY)</option>
                <option value="SECONDARY">Вторичная (SECONDARY)</option>
                <option value="SUCCESS">Успех (SUCCESS)</option>
                <option value="DANGER">Опасность (DANGER)</option>
              </select>
              <label>
                <input 
                  v-model="selectedNode.data.button_disabled" 
                  type="checkbox" 
                  class="form-checkbox"
                  @change="saveToHistory"
                />
                Отключена
              </label>
            </div>

            <div v-if="selectedNode.data.actionType === 'send_form'" class="form-group">
              <label>Название формы:</label>
              <input 
                v-model="selectedNode.data.form_name" 
                type="text" 
                placeholder="feedback-form"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.actionType === 'add_role'" class="form-group">
              <label>ID роли:</label>
              <input 
                v-model="selectedNode.data.role_id" 
                type="text" 
                placeholder="1234567890123456789"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.actionType === 'resolve_placeholders'" class="form-group">
              <label>Шаблон:</label>
              <textarea 
                v-model="selectedNode.data.template" 
                placeholder="%player_name% has %player_health% health"
                class="form-textarea"
                rows="3"
                @input="saveToHistory"
              ></textarea>
              <label>Игрок:</label>
              <input 
                v-model="selectedNode.data.player" 
                type="text" 
                placeholder="{player}"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.actionType === 'send_page'" class="form-group">
              <label>ID страницы:</label>
              <input 
                v-model="selectedNode.data.page_id" 
                type="text" 
                placeholder="1-embed"
                class="form-input"
                @input="saveToHistory"
              />
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
                <option value="permission">Права (permission)</option>
                <option value="chance">Шанс (chance)</option>
              </select>
            </div>

            <div v-if="selectedNode.data.conditionType === 'permission'" class="form-group">
              <label>ID роли:</label>
              <input 
                v-model="selectedNode.data.role_id" 
                type="text" 
                placeholder="1234567890123456789"
                class="form-input"
                @input="saveToHistory"
              />
            </div>

            <div v-if="selectedNode.data.conditionType === 'chance'" class="form-group">
              <label>Процент шанса:</label>
              <input 
                v-model="selectedNode.data.percent" 
                type="number" 
                min="1"
                max="100"
                placeholder="10"
                class="form-input"
                @input="saveToHistory"
              />
            </div>
          </div>

          <!-- Common Actions -->
          <div class="form-actions">
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
import { ref, computed, watch, onMounted } from 'vue'
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
  { type: 'option', label: 'Строка (STRING)', icon: '📝' },
  { type: 'option', label: 'Пользователь (USER)', icon: '👤' },
  { type: 'option', label: 'Канал (CHANNEL)', icon: '📢' }
])

const availableActions = ref([
  { type: 'action', label: 'Отправить сообщение', icon: '💬' },
  { type: 'action', label: 'Отправить в канал', icon: '📢' },
  { type: 'action', label: 'Удалить сообщение', icon: '🗑️' },
  { type: 'action', label: 'Кнопка', icon: '🔘' },
  { type: 'action', label: 'Редактировать компонент', icon: '✏️' },
  { type: 'action', label: 'Форма', icon: '📋' },
  { type: 'action', label: 'Добавить роль', icon: '👑' },
  { type: 'action', label: 'Разрешить плейсхолдеры', icon: '🔧' },
  { type: 'action', label: 'Отправить страницу', icon: '📄' }
])

const availableConditions = ref([
  { type: 'condition', label: 'Права (permission)', icon: '🔐' },
  { type: 'condition', label: 'Шанс (chance)', icon: '🎲' }
])

// Vue Flow elements
const elements = ref([])
const selectedNode = ref(null)
const showPreview = ref(false)
const previewTab = ref('yaml')
const menuOpen = ref(false)
const paletteTab = ref('actions')

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

// Автосохранение схемы в localStorage
watch(elements, () => {
  localStorage.setItem('discordbm-schema', JSON.stringify(elements.value));
}, { deep: true })

// Загрузка схемы из localStorage при старте
onMounted(() => {
  const saved = localStorage.getItem('discordbm-schema');
  if (saved) {
    try {
      elements.value = JSON.parse(saved);
    } catch (e) {
      // Если localStorage повреждён — игнорируем
      elements.value = [];
    }
  }
})

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
        optionType: 'STRING',
        required: false
      }
    case 'action':
      return {
        actionType: 'send_message',
        message: '',
        response_type: 'REPLY',
        label: '',
        embed: null,
        channel: '',
        delete_all: false,
        response_message: '',
        button_label: '',
        button_style: 'PRIMARY',
        button_url: '',
        button_emoji: '',
        button_disabled: false,
        button_id: '',
        button_message: '',
        target_id: '',
        target_message: '',
        component_id: '',
        form_name: '',
        role_id: '',
        template: '',
        player: '',
        page_id: ''
      }
    case 'condition':
      return {
        conditionType: 'permission',
        role_id: '',
        percent: 50
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

function handleNodeDelete(nodeId) {
  // Удаляем node и все связанные edges
  elements.value = elements.value.filter(el => el.id !== nodeId && (el.source !== nodeId && el.target !== nodeId))
  if (selectedNode.value && selectedNode.value.id === nodeId) selectedNode.value = null
  saveToHistory()
}

function handleNodeSelect(nodeId) {
  const node = elements.value.find(el => el.id === nodeId)
  if (node) selectedNode.value = node
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
  const commands = []
  
  // Group nodes by command (assuming first option node starts a new command)
  const optionNodes = nodes.filter(n => n.data.type === 'option')
  const actionNodes = nodes.filter(n => n.data.type === 'action')
  const conditionNodes = nodes.filter(n => n.data.type === 'condition')
  
  // Create a simple command structure
  const command = {
    name: "generated_command",
    description: "Generated by Visual Editor",
    context: "server",
    ephemeral: false
  }
  
  // Process options
  if (optionNodes.length > 0) {
    command.options = optionNodes.map(node => ({
      name: node.data.name || "option",
      type: node.data.optionType || "STRING",
      description: node.data.description || "Generated option",
      required: node.data.required || false
    }))
  }
  
  // Process conditions
  if (conditionNodes.length > 0) {
    command.conditions = conditionNodes.map(condition => {
      const conditionData = {
        type: condition.data.conditionType
      }
      
      switch (condition.data.conditionType) {
        case 'permission':
          conditionData.role_id = condition.data.role_id
          break
        case 'chance':
          conditionData.percent = condition.data.percent
          break
      }
      
      return conditionData
    })
  }
  
  // Process actions
  if (actionNodes.length > 0) {
    command.actions = actionNodes.map(action => {
      const actionData = {
        type: action.data.actionType
      }
      
      // Add type-specific properties
      switch (action.data.actionType) {
        case 'send_message':
          if (action.data.message) actionData.message = action.data.message
          if (action.data.response_type) actionData.response_type = action.data.response_type
          if (action.data.label) actionData.label = action.data.label
          break
        case 'send_to_channel':
          if (action.data.message) actionData.message = action.data.message
          if (action.data.label) actionData.label = action.data.label
          break
        case 'delete_message':
          if (action.data.label) actionData.label = action.data.label
          if (action.data.delete_all !== undefined) actionData.delete_all = action.data.delete_all
          if (action.data.response_message) actionData.response_message = action.data.response_message
          break
        case 'button':
          if (action.data.button_label) actionData.label = action.data.button_label
          if (action.data.button_style) actionData.style = action.data.button_style
          if (action.data.button_url) actionData.url = action.data.button_url
          if (action.data.button_emoji) actionData.emoji = action.data.button_emoji
          if (action.data.button_id) actionData.id = action.data.button_id
          if (action.data.button_message) actionData.message = action.data.button_message
          if (action.data.button_disabled !== undefined) actionData.disabled = action.data.button_disabled
          break
        case 'edit_component':
          if (action.data.target_message) actionData.target_message = action.data.target_message
          if (action.data.component_id) actionData.component_id = action.data.component_id
          if (action.data.button_label) actionData.label = action.data.button_label
          if (action.data.button_style) actionData.style = action.data.button_style
          if (action.data.button_disabled !== undefined) actionData.disabled = action.data.button_disabled
          break
        case 'send_form':
          if (action.data.form_name) actionData.form_name = action.data.form_name
          break
        case 'add_role':
          if (action.data.role_id) actionData.role_id = action.data.role_id
          break
        case 'resolve_placeholders':
          if (action.data.template) actionData.template = action.data.template
          if (action.data.player) actionData.player = action.data.player
          break
        case 'send_page':
          if (action.data.page_id) actionData.page_id = action.data.page_id
          break
      }
      
      return actionData
    })
  }
  
  commands.push(command)
  
  return { commands }
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

// Глобальный обработчик клавиш для удаления выделенного блока
onMounted(() => {
  const keyHandler = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode.value) {
      handleNodeDelete(selectedNode.value.id)
    }
  }
  window.addEventListener('keydown', keyHandler)
  // Очищаем при демонтировании
  onUnmounted(() => window.removeEventListener('keydown', keyHandler))
})
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
  min-width: 0;
}

.palette {
  width: 280px;
  background: #2d2d2d;
  border-right: 1px solid #404040;
  padding: 1rem 0 1rem 0;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.palette-tabs {
  display: flex;
  margin-bottom: 0.5rem;
  border-bottom: 2px solid #444;
}
.palette-tab {
  flex: 1;
  background: none;
  border: none;
  color: #ccc;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 0.7rem 0;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}
.palette-tab.active {
  color: #fff;
  border-bottom: 2px solid #e84c4c;
  background: #23272b;
}
.palette-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.2rem 0 1.2rem;
  scrollbar-width: thin;
  scrollbar-color: #3b82f6 #23272b;
}
.palette-scroll::-webkit-scrollbar {
  width: 8px;
  background: #23272b;
}
.palette-scroll::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 6px;
}
.palette-section {
  margin-bottom: 2.2rem;
}
.palette-section h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.7rem;
  margin-top: 1.2rem;
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
  flex: 1 1 0%;
  min-width: 0;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
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
  flex-shrink: 0;
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
.menu-dropdown {
  display: inline-block;
}
.menu-list {
  position: absolute;
  right: 0;
  top: 110%;
  background: #23272b;
  border: 1px solid #404040;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  z-index: 100;
  min-width: 180px;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.menu-btn {
  width: 100%;
  text-align: left;
  border-radius: 0;
  border: none;
  background: none;
  color: #e5e7eb;
  padding: 10px 18px;
  font-size: 1em;
  transition: background 0.15s;
}
.menu-btn:hover {
  background: #3b82f6;
  color: #fff;
}
</style> 