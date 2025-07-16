<template>
  <div class="visual-command-builder">
    <div class="topbar">
      <div class="topbar-title">
        <img src="/1wairesdIndistries.png" alt="WS Logo" class="topbar-logo" />
        DiscordBM Editor
      </div>
      <div class="topbar-actions">
        <button v-if="!hasRootNode" @click="createRootCommand" class="btn btn-success">Создать команду</button>
        <button @click="openCommandsModal" class="btn btn-info">Команды</button>
        <button @click="undo" :disabled="!canUndo" class="btn btn-secondary">↶ Отменить</button>
        <button @click="redo" :disabled="!canRedo" class="btn btn-secondary">↷ Повторить</button>
        <button @click="$emit('save')" class="btn btn-success">Сохранить</button>
      </div>
    </div>


    <div class="main-content">
      <!-- Palette -->
      <div class="palette" :class="{disabled: !hasRootNode}">
        <h3>Блоки</h3>
        <div class="palette-tabs">
          <button :class="['palette-tab', {active: paletteTab==='options'}]" @click="paletteTab='options'" :disabled="!hasRootNode">Опции</button>
          <button :class="['palette-tab', {active: paletteTab==='actions'}]" @click="paletteTab='actions'" :disabled="!hasRootNode">Действия</button>
          <button :class="['palette-tab', {active: paletteTab==='conditions'}]" @click="paletteTab='conditions'" :disabled="!hasRootNode">Условия</button>
        </div>
        <div class="palette-scroll">
          <template v-if="paletteTab==='options'">
        <div class="palette-section">
          <h4>Опции</h4>
              <div v-for="option in availableOptions" :key="option.type" class="palette-item" draggable="true" @dragstart="onDragStart($event, option)" :class="{inactive: !hasRootNode}" :draggable="hasRootNode">
            <div class="palette-item-icon">{{ option.icon }}</div>
            <div class="palette-item-label">{{ option.label }}</div>
          </div>
        </div>
          </template>
          <template v-else-if="paletteTab==='actions'">
        <div class="palette-section">
          <h4>Действия</h4>
              <div v-for="action in availableActions" :key="action.type" class="palette-item" draggable="true" @dragstart="onDragStart($event, action)" :class="{inactive: !hasRootNode}" :draggable="hasRootNode">
            <div class="palette-item-icon">{{ action.icon }}</div>
            <div class="palette-item-label">{{ action.label }}</div>
          </div>
        </div>
          </template>
          <template v-else>
        <div class="palette-section">
          <h4>Условия</h4>
              <div v-for="condition in availableConditions" :key="condition.type" class="palette-item" draggable="true" @dragstart="onDragStart($event, condition)" :class="{inactive: !hasRootNode}" :draggable="hasRootNode">
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
          @connect="onConnect"
          @pane-click="onPaneClick"
          @drop="onDrop"
          @dragover.prevent
          @connect-start="onConnectStart"
          @connect-end="onConnectEnd"
          v-model:selected-nodes="selectedNodeIds"
        >
          <template #node-custom="props">
            <CustomNode
              :data="props.data"
              :selected="props.selected"
              @update="updateNodeData"
              @node-click="onNodeClick($event, props)"
            />
          </template>
        </VueFlow>
      </div>

      <!-- Properties Sidebar -->
      <div v-if="selectedNode && hasRootNode" class="properties-sidebar" :key="selectedNode?.id">
        <div class="sidebar-header">
          <h3>Свойства блока</h3>
          <button @click="closeSidebar" class="btn-close">×</button>
        </div>
        
        <div class="sidebar-content">
          <!-- Root Block Settings -->
          <div v-if="selectedNode && selectedNode.id === ROOT_NODE_ID" class="form-section">
            <h4>Настройки команды</h4>
            <div class="form-group">
              <label>Имя команды:</label>
              <input v-model="selectedNode.data.name" type="text" placeholder="hello" class="form-input" @input="saveToHistory" />
            </div>
            <div class="form-group">
              <label>Описание:</label>
              <input v-model="selectedNode.data.description" type="text" placeholder="Says hello to the user" class="form-input" @input="saveToHistory" />
            </div>
            <div class="form-group">
              <label>Контекст:</label>
              <select v-model="selectedNode.data.context" class="form-select" @change="saveToHistory">
                <option value="server">server</option>
                <option value="dm">dm</option>
                <option value="both">both</option>
              </select>
            </div>
            <div class="form-group">
              <label><input type="checkbox" v-model="selectedNode.data.ephemeral" class="form-checkbox" @change="saveToHistory" /> ephemeral</label>
            </div>
          </div>

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
                <option value="edit_message">Редактировать сообщение</option>
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

            <div v-if="selectedNode.data.actionType === 'edit_message'" class="form-group">
              <label>ID сообщения:</label>
              <input v-model="selectedNode.data.target_id" type="text" placeholder="ID сообщения" class="form-input" @input="saveToHistory" />
              <label>Новое сообщение:</label>
              <textarea v-model="selectedNode.data.message" placeholder="Введите новое сообщение" class="form-textarea" rows="3" @input="saveToHistory"></textarea>
              <label>Метка:</label>
              <input v-model="selectedNode.data.label" type="text" placeholder="Метка для ссылки" class="form-input" @input="saveToHistory" />
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

            <div class="form-group">
              <label>Действия при неудаче:</label>
              <button @click="addFailAction" class="btn btn-secondary">+ Действие при неудаче</button>
              <div v-for="(failAction, idx) in selectedNode.data.failActions || []" :key="idx" class="fail-action-block styled-fail-action">
                <div class="fail-action-header">
                  <span class="fail-action-icon">💬</span>
                  <span class="fail-action-type">{{ getActionTypeLabel(failAction.actionType) }}</span>
                  <button @click="removeFailAction(idx)" class="btn btn-danger btn-fail-action-remove">Удалить</button>
                </div>
                <div v-if="failAction.actionType === 'send_message'" class="fail-action-message">
                  <label>Сообщение:</label>
                  <input v-model="failAction.message" type="text" placeholder="Введите сообщение" class="form-input" @input="saveToHistory" />
                </div>
              </div>
            </div>
          </div>

          <!-- Common Actions -->
          <div class="form-actions">
            <button @click="deleteNode" class="btn btn-danger">Удалить</button>
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
    <div v-if="showCommandsModal" class="modal-overlay" @click.self="showCommandsModal = false">
      <div class="modal-box">
        <button class="close-btn" @click="showCommandsModal = false">×</button>
        <h2>Выберите команду</h2>
        <input v-model="commandSearch" placeholder="Поиск..." class="modal-search" />
        <div v-if="commandsLoading" class="modal-loading">Загрузка...</div>
        <div v-else-if="commandsError" class="modal-error">Ошибка загрузки: {{ commandsError }}</div>
        <ul class="modal-list">
          <li v-for="(cmd, idx) in filteredCommands" :key="idx" class="modal-list-item">
            <div class="cmd-main">
              <div class="cmd-name">{{ cmd.name }}</div>
              <div class="cmd-desc">{{ cmd.description }}</div>
            </div>
            <button class="btn btn-primary" @click="selectCommand(idx)">Загрузить</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { VueFlow, ConnectionMode } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import CustomNode from './CustomNode.vue'
import axios from 'axios'

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
  { type: 'action', label: 'Отправить страницу', icon: '📄' },
  { type: 'action', label: 'Редактировать сообщение', icon: '✏️' }
])

const availableConditions = ref([
  { type: 'condition', label: 'Права (permission)', icon: '🔐' },
  { type: 'condition', label: 'Шанс (chance)', icon: '🎲' }
])

const ROOT_NODE_ID = 'node-root'
const rootNode = {
  id: ROOT_NODE_ID,
  type: 'custom',
  position: { x: 400, y: 200 },
  data: {
    type: 'root',
    name: '/',
    description: 'Drag and drop different <span style="color:#d946ef">options</span> and <span style="color:#3b82f6">actions</span> to add them to your command. Connect the corresponding colors to create your command.'
  }
}

// Vue Flow elements
const elements = ref([])
const selectedNodeIds = ref([])
const selectedNode = computed(() => elements.value.find(el => el.id === selectedNodeIds.value[0]))
const paletteTab = ref('actions')
const hasRootNode = computed(() => elements.value.some(el => el.id === ROOT_NODE_ID))

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
      const loaded = JSON.parse(saved);
      if (Array.isArray(loaded) && loaded.length > 0) {
        // Гарантируем наличие rootNode
        if (!loaded.find(el => el.id === ROOT_NODE_ID)) {
          loaded.unshift(rootNode)
        }
        elements.value = loaded
      } else {
        elements.value = [rootNode]
      }
    } catch (e) {
      elements.value = [rootNode]
    }
  } else {
    elements.value = [rootNode]
  }
  selectedNodeIds.value = [ROOT_NODE_ID]
})

// Drag and drop handlers
const onDragStart = (event, block) => {
  event.dataTransfer.setData('application/vueflow', JSON.stringify(block))
  event.dataTransfer.effectAllowed = 'move'
}

// onDrop: запрещаем добавление блоков, если нет rootNode
const onDrop = (event) => {
  if (!hasRootNode.value) return;
  const blockData = JSON.parse(event.dataTransfer.getData('application/vueflow'))
  
  // Get the canvas element to calculate position
  const canvas = event.target.closest('.vue-flow__viewport')
  const rect = canvas.getBoundingClientRect()
  
  // Calculate position relative to the canvas
  const position = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  
  // Гарантируем, что rootNode всегда есть
  if (!elements.value.find(el => el.id === ROOT_NODE_ID)) {
    elements.value.unshift({ ...rootNode });
    // Если других custom-блоков нет, выделяем root
    const customNodes = elements.value.filter(el => el.type === 'custom');
    if (customNodes.length === 1 && customNodes[0].id === ROOT_NODE_ID) {
      selectedNodeIds.value = [ROOT_NODE_ID];
    }
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
  selectedNodeIds.value = [newNode.id];
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
        page_id: '',
        failActions: []
      }
    case 'condition':
      return {
        conditionType: 'permission',
        role_id: '',
        percent: 50,
        failActions: []
      }
    default:
      return {}
  }
}

// Node interaction handlers
const onNodeClick = (event, node) => {
  // node.id — id выделенного блока
  if (elements.value.find(el => el.id === node.id)) {
    selectedNodeIds.value = [node.id]
  }
}

// Не сбрасываем выделение при клике по пустому месту
const onPaneClick = () => {
  // ничего не делаем, выделение не сбрасывается
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
  // Не сбрасываем выделение, чтобы всегда был выбран rootNode
  selectedNodeIds.value = [ROOT_NODE_ID]
}

const updateNodeData = (nodeId, newData) => {
  const node = elements.value.find(el => el.id === nodeId)
  if (node) {
    Object.assign(node.data, newData)
  }
}

// Запретить удаление rootNode
const deleteNode = () => {
  if (selectedNode.value && selectedNode.value.id !== ROOT_NODE_ID) {
    const deletedId = selectedNode.value.id;
    elements.value = elements.value.filter(el => 
      el.id !== deletedId && 
      (el.source !== deletedId && el.target !== deletedId)
    );
    // Если остался только root, выделяем root, иначе выделяем первый оставшийся блок
    const customNodes = elements.value.filter(el => el.type === 'custom');
    if (customNodes.length === 1 && customNodes[0].id === ROOT_NODE_ID) {
      selectedNodeIds.value = [ROOT_NODE_ID];
    } else if (customNodes.length > 0) {
      selectedNodeIds.value = [customNodes[0].id];
    } else {
      // Если вообще нет custom-блоков (маловероятно), создаём root
      elements.value = [rootNode];
      selectedNodeIds.value = [ROOT_NODE_ID];
    }
    saveToHistory();
  } else if (selectedNode.value && selectedNode.value.id === ROOT_NODE_ID) {
    // Удаляем rootNode — сбрасываем всё
    elements.value = []
    selectedNodeIds.value = []
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

// Удаление по клавише Delete/Backspace
function handleKeydown(e) {
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode.value) {
    // Запретить удаление rootNode
    if (selectedNode.value.id === ROOT_NODE_ID) return;
    deleteNode();
  }
}
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const showCommandsModal = ref(false)
const commands = ref([])
const commandsLoading = ref(false)
const commandsError = ref('')
const commandSearch = ref('')
const filteredCommands = computed(() => {
  if (!commandSearch.value) return commands.value
  return commands.value.filter(cmd =>
    (cmd.name || '').toLowerCase().includes(commandSearch.value.toLowerCase()) ||
    (cmd.description || '').toLowerCase().includes(commandSearch.value.toLowerCase())
  )
})

function openCommandsModal() {
  showCommandsModal.value = true
  if (commands.value.length === 0) {
    loadCommandsFromBytebin()
  }
}

async function loadCommandsFromBytebin() {
  commandsLoading.value = true
  commandsError.value = ''
  try {
    // Получаем ключ из URL (hash)
    const hash = window.location.hash.replace('#', '')
    if (!hash) {
      commandsError.value = 'Нет кода Bytebin в URL.'
      commandsLoading.value = false
      return
    }
    const url = `https://bytebin.lucko.me/${hash}`
    const resp = await axios.get(url, { responseType: 'json' })
    // Ожидаем структуру { commands: [...] }
    let data = resp.data
    if (typeof data === 'string') data = JSON.parse(data)
    if (data.commands && Array.isArray(data.commands)) {
      commands.value = data.commands
    } else if (Array.isArray(data)) {
      commands.value = data
    } else {
      commandsError.value = 'Некорректный формат данных.'
    }
  } catch (e) {
    commandsError.value = e.message || 'Ошибка загрузки.'
  } finally {
    commandsLoading.value = false
  }
}

function selectCommand(idx) {
  const cmd = filteredCommands.value[idx]
  if (!cmd) return
  // Преобразуем команду в nodes для редактора
  // Очищаем все, кроме rootNode
  elements.value = [
    {
      ...rootNode,
      data: {
        ...rootNode.data,
        name: cmd.name || '/',
        description: cmd.description || '',
        context: cmd.context || 'server',
        ephemeral: cmd.ephemeral || false
      }
    }
  ]
  nodeIdCounter = 1
  // Добавляем options
  if (Array.isArray(cmd.options)) {
    for (const opt of cmd.options) {
      elements.value.push({
        id: `node-${nodeIdCounter++}`,
        type: 'custom',
        position: { x: 400 + nodeIdCounter * 40, y: 300 },
        data: {
          type: 'option',
          name: opt.name,
          description: opt.description,
          optionType: opt.type,
          required: opt.required || false
        }
      })
    }
  }
  // Добавляем actions
  if (Array.isArray(cmd.actions)) {
    for (const act of cmd.actions) {
      elements.value.push({
        id: `node-${nodeIdCounter++}`,
        type: 'custom',
        position: { x: 400 + nodeIdCounter * 40, y: 400 },
        data: {
          type: 'action',
          name: act.label || act.type,
          description: act.message || '',
          actionType: act.type,
          ...act
        }
      })
    }
  }
  // Добавляем conditions
  if (Array.isArray(cmd.conditions)) {
    for (const cond of cmd.conditions) {
      elements.value.push({
        id: `node-${nodeIdCounter++}`,
        type: 'custom',
        position: { x: 400 + nodeIdCounter * 40, y: 500 },
        data: {
          type: 'condition',
          name: cond.type,
          description: '',
          conditionType: cond.type,
          ...cond
        }
      })
    }
  }
  selectedNodeIds.value = [ROOT_NODE_ID]
  saveToHistory()
  showCommandsModal.value = false
}

function createRootCommand() {
  if (!elements.value.some(el => el.id === ROOT_NODE_ID)) {
    elements.value = [{ ...rootNode }]
    selectedNodeIds.value = [ROOT_NODE_ID]
    saveToHistory()
  }
}

function addFailAction() {
  if (selectedNode.value && selectedNode.value.id === ROOT_NODE_ID) return;
  const newFailAction = {
    actionType: 'send_message', // Default to send_message
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
    page_id: '',
    failActions: [] // Ensure it's an array
  };
  updateNodeData(selectedNode.value.id, { failActions: [...(selectedNode.value.data.failActions || []), newFailAction] });
  saveToHistory();
}

function removeFailAction(index) {
  if (selectedNode.value && selectedNode.value.id === ROOT_NODE_ID) return;
  const newFailActions = (selectedNode.value.data.failActions || []).filter((_, i) => i !== index);
  updateNodeData(selectedNode.value.id, { failActions: newFailActions });
  saveToHistory();
}

function getActionTypeLabel(type) {
  const typeMap = {
    'send_message': 'Отправить сообщение',
    'send_to_channel': 'Отправить в канал',
    'delete_message': 'Удалить сообщение',
    'button': 'Кнопка',
    'edit_component': 'Редактировать компонент',
    'send_form': 'Форма',
    'add_role': 'Добавить роль',
    'resolve_placeholders': 'Разрешить плейсхолдеры',
    'send_page': 'Отправить страницу',
    'edit_message': 'Редактировать сообщение'
  }
  return typeMap[type] || type
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
  transition: all 0.2s ease;
}

.palette-item:hover {
  background: #525252;
  border-color: #6b7280;
  transform: translateY(-1px);
}

.palette-item:active {
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

.canvas, .canvas-container, :deep(.vue-flow__pane) {
  cursor: default !important;
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
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box {
  background: #23272b;
  border-radius: 12px;
  padding: 2rem 2.5rem 2rem 2.5rem;
  min-width: 340px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.35);
  position: relative;
  color: #fff;
}
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #aaa;
  font-size: 2rem;
  cursor: pointer;
}
.close-btn:hover {
  color: #fff;
}
.modal-search {
  width: 100%;
  margin-bottom: 1rem;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  background: #181c20;
  color: #fff;
}
.modal-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 320px;
  overflow-y: auto;
}
.modal-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #3335;
}
.cmd-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
}
.cmd-name {
  font-weight: 700;
  font-size: 1.08em;
  color: #fff;
  margin-bottom: 2px;
  margin-left: 2px;
}
.cmd-desc {
  color: #b9bbbe;
  font-size: 0.97em;
  margin-left: 6px;
  margin-top: 0;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.modal-loading {
  color: #aaa;
  margin-bottom: 1rem;
}
.modal-error {
  color: #ff4d4d;
  margin-bottom: 1rem;
}
.palette.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.palette .palette-item.inactive {
  opacity: 0.5;
  pointer-events: none;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1.5rem 0.7rem 1.5rem;
  background: #23272b;
  border-bottom: 1px solid #404040;
}
.topbar-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}
.topbar-logo {
  height: 32px;
  width: 32px;
  margin-right: 12px;
  vertical-align: middle;
}
.topbar-actions {
  display: flex;
  gap: 0.7rem;
}
.styled-fail-action {
  background: #23272b;
  border-radius: 8px;
  padding: 12px 14px;
  margin: 10px 0;
  border: 1px solid #444;
  box-shadow: 0 2px 8px #0002;
}
.fail-action-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.fail-action-icon {
  font-size: 1.2em;
}
.fail-action-type {
  font-weight: 600;
  color: #fff;
  background: #3b82f6;
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 0.95em;
}
.btn-fail-action-remove {
  margin-left: auto;
  font-size: 0.9em;
  padding: 2px 8px;
}
.fail-action-message label {
  font-size: 0.95em;
  color: #bbb;
  margin-bottom: 2px;
  display: block;
}
.fail-action-message input {
  width: 100%;
  margin-top: 2px;
}
</style> 