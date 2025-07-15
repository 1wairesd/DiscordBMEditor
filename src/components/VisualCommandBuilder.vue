<template>
  <div class="visual-command-builder">
    <!-- Header -->
    <div class="header">
      <h2>Визуальный редактор команд</h2>
      <div class="header-actions">
        <button @click="saveSchema" class="btn btn-primary">Сохранить схему</button>
        <button @click="loadSchema" class="btn btn-secondary">Загрузить схему</button>
        <button @click="exportYaml" class="btn btn-success">Экспорт YAML</button>
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
      </div>

      <!-- Canvas -->
      <div class="canvas-container">
        <VueFlow
          v-model="elements"
          :default-viewport="{ zoom: 1 }"
          :min-zoom="0.2"
          :max-zoom="4"
          :node-types="nodeTypes"
          class="canvas"
          @node-click="onNodeClick"
          @connect="onConnect"
          @pane-click="onPaneClick"
          @drop="onDrop"
          @dragover.prevent
        >
          <template #node-custom="props">
            <CustomNode
              :data="props.data"
              :selected="props.selected"
              @update="updateNodeData"
            />
          </template>
          
          <Controls />
          <MiniMap />
          <Background />
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
              />
            </div>

            <div class="form-group">
              <label>Описание:</label>
              <textarea 
                v-model="selectedNode.data.description" 
                placeholder="Введите описание опции"
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Тип опции:</label>
              <select v-model="selectedNode.data.optionType" class="form-select">
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
              />
            </div>

            <div class="form-group">
              <label>
                <input 
                  v-model="selectedNode.data.required" 
                  type="checkbox" 
                  class="form-checkbox"
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
              />
            </div>

            <div class="form-group">
              <label>Тип действия:</label>
              <select v-model="selectedNode.data.actionType" class="form-select">
                <option value="message">Отправить сообщение</option>
                <option value="command">Выполнить команду</option>
                <option value="teleport">Телепортация</option>
                <option value="give">Выдать предмет</option>
                <option value="effect">Эффект</option>
                <option value="sound">Звук</option>
              </select>
            </div>

            <div v-if="selectedNode.data.actionType === 'message'" class="form-group">
              <label>Сообщение:</label>
              <textarea 
                v-model="selectedNode.data.message" 
                placeholder="Введите сообщение"
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <div v-if="selectedNode.data.actionType === 'command'" class="form-group">
              <label>Команда:</label>
              <input 
                v-model="selectedNode.data.command" 
                type="text" 
                placeholder="Введите команду"
                class="form-input"
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
                />
                <input 
                  v-model="selectedNode.data.y" 
                  type="number" 
                  placeholder="Y"
                  class="form-input coord-input"
                />
                <input 
                  v-model="selectedNode.data.z" 
                  type="number" 
                  placeholder="Z"
                  class="form-input coord-input"
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
              />
              <label>Количество:</label>
              <input 
                v-model="selectedNode.data.amount" 
                type="number" 
                placeholder="1"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Задержка (сек):</label>
              <input 
                v-model="selectedNode.data.delay" 
                type="number" 
                placeholder="0"
                class="form-input"
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
              />
            </div>

            <div class="form-group">
              <label>Тип условия:</label>
              <select v-model="selectedNode.data.conditionType" class="form-select">
                <option value="permission">Права</option>
                <option value="world">Мир</option>
                <option value="gamemode">Режим игры</option>
                <option value="time">Время</option>
                <option value="weather">Погода</option>
                <option value="custom">Пользовательское</option>
              </select>
            </div>

            <div v-if="selectedNode.data.conditionType === 'permission'" class="form-group">
              <label>Право:</label>
              <input 
                v-model="selectedNode.data.permission" 
                type="text" 
                placeholder="example.permission"
                class="form-input"
              />
            </div>

            <div v-if="selectedNode.data.conditionType === 'world'" class="form-group">
              <label>Мир:</label>
              <input 
                v-model="selectedNode.data.world" 
                type="text" 
                placeholder="world"
                class="form-input"
              />
            </div>

            <div v-if="selectedNode.data.conditionType === 'gamemode'" class="form-group">
              <label>Режим игры:</label>
              <select v-model="selectedNode.data.gamemode" class="form-select">
                <option value="SURVIVAL">Выживание</option>
                <option value="CREATIVE">Творческий</option>
                <option value="ADVENTURE">Приключения</option>
                <option value="SPECTATOR">Наблюдатель</option>
              </select>
            </div>

            <div v-if="selectedNode.data.conditionType === 'time'" class="form-group">
              <label>Время дня:</label>
              <select v-model="selectedNode.data.time" class="form-select">
                <option value="day">День</option>
                <option value="night">Ночь</option>
                <option value="morning">Утро</option>
                <option value="evening">Вечер</option>
              </select>
            </div>

            <div v-if="selectedNode.data.conditionType === 'weather'" class="form-group">
              <label>Погода:</label>
              <select v-model="selectedNode.data.weather" class="form-select">
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
              ></textarea>
            </div>
          </div>

          <!-- Common Actions -->
          <div class="form-actions">
            <button @click="deleteNode" class="btn btn-danger">Удалить блок</button>
            <button @click="duplicateNode" class="btn btn-secondary">Дублировать</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VueFlow, useVueFlow, Background, MiniMap, Controls } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import CustomNode from './CustomNode.vue'

// Register custom node type
const nodeTypes = {
  custom: CustomNode
}

// Available blocks for palette
const availableOptions = ref([
  { type: 'option', label: 'Опция', icon: '⚙️' }
])

const availableActions = ref([
  { type: 'action', label: 'Действие', icon: '🎯' }
])

const availableConditions = ref([
  { type: 'condition', label: 'Условие', icon: '🔍' }
])

// Vue Flow elements
const elements = ref([])
const selectedNode = ref(null)

// Node counter for unique IDs
let nodeIdCounter = 1

// Drag and drop handlers
const onDragStart = (event, block) => {
  event.dataTransfer.setData('application/vueflow', JSON.stringify(block))
  event.dataTransfer.effectAllowed = 'move'
}

const onDrop = (event) => {
  const blockData = JSON.parse(event.dataTransfer.getData('application/vueflow'))
  
  // Get the VueFlow instance to access viewport
  const { project } = useVueFlow()
  
  // Calculate position relative to the viewport
  const position = project({
    x: event.clientX,
    y: event.clientY
  })
  
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
        amount: 1
      }
    case 'condition':
      return {
        conditionType: 'permission',
        permission: '',
        world: '',
        gamemode: 'SURVIVAL',
        time: 'day',
        weather: 'clear',
        expression: ''
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

const onConnect = (params) => {
  const newEdge = {
    id: `edge-${Date.now()}`,
    source: params.source,
    target: params.target,
    type: 'smoothstep'
  }
  elements.value.push(newEdge)
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
  }
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
  // Convert flow elements to YAML format
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
  
  nodes.forEach(node => {
    if (node.data.type === 'option') {
      if (!commands.options) commands.options = {}
      commands.options[node.data.name] = {
        description: node.data.description,
        type: node.data.optionType,
        required: node.data.required
      }
      if (node.data.values) {
        commands.options[node.data.name].values = node.data.values.split(',').map(v => v.trim())
      }
    }
  })
  
  // Process actions and conditions
  const actions = nodes.filter(n => n.data.type === 'action')
  const conditions = nodes.filter(n => n.data.type === 'condition')
  
  if (actions.length > 0) {
    commands.actions = actions.map(action => ({
      type: action.data.actionType,
      ...action.data
    }))
  }
  
  if (conditions.length > 0) {
    commands.conditions = conditions.map(condition => ({
      type: condition.data.conditionType,
      ...condition.data
    }))
  }
  
  return commands
}
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

/* Responsive design */
@media (max-width: 1200px) {
  .palette {
    width: 240px;
  }
  
  .properties-sidebar {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .palette {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #404040;
  }
  
  .properties-sidebar {
    width: 100%;
    height: 300px;
    border-left: none;
    border-top: 1px solid #404040;
  }
}
</style> 