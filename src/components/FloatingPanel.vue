<template>
  <div
    class="floating-panel active"
    :style="panelStyle"
    ref="panelRef"
    @mousedown.self="startDrag"
  >
    <div class="floating-panel-header" @mousedown.stop="startDrag">
      <h3>Свойства блока</h3>
      <button class="floating-panel-close-btn" @click="$emit('close')">×</button>
    </div>
    <div class="floating-panel-content">
      <!-- Root Block Settings -->
      <div v-if="node && node.id === ROOT_NODE_ID" class="form-section">
        <h4>Настройки команды</h4>
        <div class="form-group">
          <label>Имя команды:</label>
          <input v-model="node.data.name" type="text" placeholder="hello" class="form-input" @input="emitUpdate" />
        </div>
        <div class="form-group">
          <label>Описание:</label>
          <input v-model="node.data.description" type="text" placeholder="Says hello to the user" class="form-input" @input="emitUpdate" />
        </div>
        <div class="form-group">
          <label>Контекст:</label>
          <select v-model="node.data.context" class="form-select" @change="emitUpdate">
            <option value="server">server</option>
            <option value="dm">dm</option>
            <option value="both">both</option>
          </select>
        </div>
        <div class="form-group">
          <label><input type="checkbox" v-model="node.data.ephemeral" class="form-checkbox" @change="emitUpdate" /> ephemeral</label>
        </div>
      </div>
      <!-- Options Form -->
      <div v-if="node.data.type === 'option'" class="form-section">
        <h4>Настройки опции</h4>
        <div class="form-group">
          <label>Название опции:</label>
          <input v-model="node.data.name" type="text" placeholder="Введите название опции" class="form-input" @input="emitUpdate" />
        </div>
        <div class="form-group">
          <label>Описание:</label>
          <textarea v-model="node.data.description" placeholder="Введите описание опции" class="form-textarea" rows="3" @input="emitUpdate"></textarea>
        </div>
        <div class="form-group">
          <label>Тип опции:</label>
          <select v-model="node.data.optionType" class="form-select" @change="emitUpdate">
            <option value="STRING">Строка (STRING)</option>
            <option value="USER">Пользователь (USER)</option>
            <option value="CHANNEL">Канал (CHANNEL)</option>
          </select>
        </div>
        <div class="form-group">
          <label>
            <input v-model="node.data.required" type="checkbox" class="form-checkbox" @change="emitUpdate" />
            Обязательная опция
          </label>
        </div>
      </div>
      <!-- Actions Form -->
      <div v-if="node.data.type === 'action'" class="form-section">
        <h4>Настройки действия</h4>
        <div class="form-group">
          <label>Название действия:</label>
          <input v-model="node.data.name" type="text" placeholder="Введите название действия" class="form-input" @input="emitUpdate" />
        </div>
        <div class="form-group">
          <label>Тип действия:</label>
          <select v-model="node.data.actionType" class="form-select" @change="emitUpdate">
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
        <div v-if="node.data.actionType === 'send_message'" class="form-group">
          <label>Сообщение:</label>
          <textarea v-model="node.data.message" placeholder="Введите сообщение" class="form-textarea" rows="3" @input="emitUpdate"></textarea>
          <label>Тип ответа:</label>
          <select v-model="node.data.response_type" class="form-select" @change="emitUpdate">
            <option value="REPLY">Ответ (REPLY)</option>
            <option value="edit_message">Редактировать сообщение</option>
          </select>
          <label>Метка:</label>
          <input v-model="node.data.label" type="text" placeholder="Метка для ссылки" class="form-input" @input="emitUpdate" />
        </div>
        <div v-if="node.data.actionType === 'send_to_channel'" class="form-group">
          <label>Сообщение:</label>
          <textarea v-model="node.data.message" placeholder="Введите сообщение" class="form-textarea" rows="3" @input="emitUpdate"></textarea>
          <label>Метка:</label>
          <input v-model="node.data.label" type="text" placeholder="Метка для ссылки" class="form-input" @input="emitUpdate" />
        </div>
        <div v-if="node.data.actionType === 'delete_message'" class="form-group">
          <label>Метка:</label>
          <input v-model="node.data.label" type="text" placeholder="Метка сообщения для удаления" class="form-input" @input="emitUpdate" />
          <label>
            <input v-model="node.data.delete_all" type="checkbox" class="form-checkbox" @change="emitUpdate" />
            Удалить все
          </label>
          <label>Сообщение об удалении:</label>
          <input v-model="node.data.response_message" type="text" placeholder="Сообщение после удаления" class="form-input" @input="emitUpdate" />
        </div>
        <div v-if="node.data.actionType === 'button'" class="form-group">
          <label>Текст кнопки:</label>
          <input v-model="node.data.button_label" type="text" placeholder="Текст кнопки" class="form-input" @input="emitUpdate" />
          <label>Стиль кнопки:</label>
          <select v-model="node.data.button_style" class="form-select" @change="emitUpdate">
            <option value="PRIMARY">Основная (PRIMARY)</option>
            <option value="SECONDARY">Вторичная (SECONDARY)</option>
            <option value="SUCCESS">Успех (SUCCESS)</option>
            <option value="DANGER">Опасность (DANGER)</option>
            <option value="LINK">Ссылка (LINK)</option>
          </select>
          <label>URL (для LINK):</label>
          <input v-model="node.data.button_url" type="text" placeholder="https://example.com" class="form-input" @input="emitUpdate" />
          <label>Эмодзи:</label>
          <input v-model="node.data.button_emoji" type="text" placeholder="🔗" class="form-input" @input="emitUpdate" />
          <label>ID кнопки:</label>
          <input v-model="node.data.button_id" type="text" placeholder="btn_click" class="form-input" @input="emitUpdate" />
          <label>Сообщение кнопки:</label>
          <input v-model="node.data.button_message" type="text" placeholder="Сообщение при нажатии" class="form-input" @input="emitUpdate" />
          <label>
            <input v-model="node.data.button_disabled" type="checkbox" class="form-checkbox" @change="emitUpdate" />
            Отключена
          </label>
        </div>
        <div v-if="node.data.actionType === 'edit_component'" class="form-group">
          <label>Целевое сообщение:</label>
          <input v-model="node.data.target_message" type="text" placeholder="Метка сообщения" class="form-input" @input="emitUpdate" />
          <label>ID компонента:</label>
          <input v-model="node.data.component_id" type="text" placeholder="btn_click" class="form-input" @input="emitUpdate" />
          <label>Новый текст:</label>
          <input v-model="node.data.button_label" type="text" placeholder="Новый текст кнопки" class="form-input" @input="emitUpdate" />
          <label>Новый стиль:</label>
          <select v-model="node.data.button_style" class="form-select" @change="emitUpdate">
            <option value="PRIMARY">Основная (PRIMARY)</option>
            <option value="SECONDARY">Вторичная (SECONDARY)</option>
            <option value="SUCCESS">Успех (SUCCESS)</option>
            <option value="DANGER">Опасность (DANGER)</option>
          </select>
          <label>
            <input v-model="node.data.button_disabled" type="checkbox" class="form-checkbox" @change="emitUpdate" />
            Отключена
          </label>
        </div>
        <div v-if="node.data.actionType === 'send_form'" class="form-group">
          <label>Название формы:</label>
          <input v-model="node.data.form_name" type="text" placeholder="feedback-form" class="form-input" @input="emitUpdate" />
        </div>
        <div v-if="node.data.actionType === 'add_role'" class="form-group">
          <label>ID роли:</label>
          <input v-model="node.data.role_id" type="text" placeholder="1234567890123456789" class="form-input" @input="emitUpdate" />
        </div>
        <div v-if="node.data.actionType === 'resolve_placeholders'" class="form-group">
          <label>Шаблон:</label>
          <textarea v-model="node.data.template" placeholder="%player_name% has %player_health% health" class="form-textarea" rows="3" @input="emitUpdate"></textarea>
          <label>Игрок:</label>
          <input v-model="node.data.player" type="text" placeholder="{player}" class="form-input" @input="emitUpdate" />
        </div>
        <div v-if="node.data.actionType === 'send_page'" class="form-group">
          <label>ID страницы:</label>
          <input v-model="node.data.page_id" type="text" placeholder="1-embed" class="form-input" @input="emitUpdate" />
        </div>
        <div class="form-group">
          <label>Задержка (сек):</label>
          <input v-model="node.data.delay" type="number" placeholder="0" class="form-input" @input="emitUpdate" />
        </div>
      </div>
      <!-- Conditions Form -->
      <div v-if="node.data.type === 'condition'" class="form-section">
        <h4>Настройки условия</h4>
        <div class="form-group">
          <label>Название условия:</label>
          <input v-model="node.data.name" type="text" placeholder="Введите название условия" class="form-input" @input="emitUpdate" />
        </div>
        <div class="form-group">
          <label>Тип условия:</label>
          <select v-model="node.data.conditionType" class="form-select" @change="emitUpdate">
            <option value="permission">Права (permission)</option>
            <option value="chance">Шанс (chance)</option>
          </select>
        </div>
        <div v-if="node.data.conditionType === 'permission'" class="form-group">
          <label>ID роли:</label>
          <input v-model="node.data.role_id" type="text" placeholder="1234567890123456789" class="form-input" @input="emitUpdate" />
        </div>
        <div v-if="node.data.conditionType === 'chance'" class="form-group">
          <label>Процент шанса:</label>
          <input v-model="node.data.percent" type="number" min="1" max="100" placeholder="10" class="form-input" @input="emitUpdate" />
        </div>
      </div>
    </div>
    <div class="floating-panel-footer">
      <button @click="$emit('deleteNode')" class="btn btn-danger">Удалить</button>
      <button @click="$emit('duplicateNode')" class="btn btn-secondary">Дублировать</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
const props = defineProps({
  node: { type: Object, required: true },
  canvasSelector: { type: String, default: '.canvas-container' }
})
const emit = defineEmits(['close', 'updateNodeData', 'deleteNode', 'duplicateNode'])
const ROOT_NODE_ID = 'node-root'
const panelRef = ref(null)
const dragging = ref(false)
const offset = ref({ x: 0, y: 0 })
const position = ref({ x: 0, y: 0 })

function emitUpdate() {
  emit('updateNodeData', props.node.id, { ...props.node.data })
}

function startDrag(e) {
  dragging.value = true
  offset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}
function onDrag(e) {
  if (!dragging.value) return
  position.value = {
    x: e.clientX - offset.value.x,
    y: e.clientY - offset.value.y
  }
}
function stopDrag() {
  dragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Автоматически позиционируем панель рядом с блоком
function updatePanelPosition() {
  const canvas = document.querySelector(props.canvasSelector)
  if (!canvas || !props.node?.position) return
  const rect = canvas.getBoundingClientRect()
  // Смещаем панель относительно блока (правее и чуть выше)
  position.value = {
    x: rect.left + props.node.position.x + 180,
    y: rect.top + props.node.position.y - 40
  }
}

watch(() => props.node?.id, () => {
  updatePanelPosition()
})
onMounted(() => {
  updatePanelPosition()
})

const panelStyle = computed(() => ({
  left: position.value.x + 'px',
  top: position.value.y + 'px',
  pointerEvents: 'auto',
}))
</script>

<style scoped>
.floating-panel {
  position: absolute;
  min-width: 320px;
  max-width: 400px;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  z-index: 100;
  user-select: none;
}
.floating-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #404040;
  background: #36393f;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  cursor: move;
}
.floating-panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #e5e7eb;
}
.floating-panel-close-btn {
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
.floating-panel-close-btn:hover {
  background: #404040;
  color: #e5e7eb;
}
.floating-panel-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  max-height: 60vh;
  scrollbar-width: thin;
  scrollbar-color: #3b82f6 #23272b;
}
.floating-panel-content::-webkit-scrollbar {
  width: 8px;
  background: #23272b;
}
.floating-panel-content::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 6px;
}
.floating-panel-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #404040;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
</style> 