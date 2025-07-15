<template>
  <div class="custom-node" :class="{ selected }">
    <div class="node-header" :class="`type-${data.type}`">
      <div class="node-icon">{{ getIcon() }}</div>
      <div class="node-title" v-if="data.type === 'root'">{{ data.name || getDefaultName() }}</div>
      <div class="node-title" v-else>{{ data.name || getDefaultName() }}</div>
    </div>
    
    <div class="node-content">
      <div class="node-description" v-if="data.type === 'root'" v-html="data.description || getDefaultDescription()"></div>
      <div class="node-description" v-else>{{ data.description || getDefaultDescription() }}</div>
      
      <!-- Option specific content -->
      <div v-if="data.type === 'option'" class="node-details">
        <div class="detail-item">
          <span class="detail-label">Тип:</span>
          <span class="detail-value">{{ getOptionTypeLabel() }}</span>
        </div>
        <div v-if="data.required" class="detail-item">
          <span class="detail-label">Обязательная</span>
        </div>
      </div>
      
      <!-- Action specific content -->
      <div v-if="data.type === 'action'" class="node-details">
        <div class="detail-item">
          <span class="detail-label">Действие:</span>
          <span class="detail-value">{{ getActionTypeLabel() }}</span>
        </div>
        <div v-if="data.delay > 0" class="detail-item">
          <span class="detail-label">Задержка:</span>
          <span class="detail-value">{{ data.delay }}с</span>
        </div>
      </div>
      
      <!-- Condition specific content -->
      <div v-if="data.type === 'condition'" class="node-details">
        <div class="detail-item">
          <span class="detail-label">Условие:</span>
          <span class="detail-value">{{ getConditionTypeLabel() }}</span>
        </div>
      </div>
    </div>
    
    <!-- Connection handles -->
    <div class="node-handles">
      <!-- Top handle -->
      <Handle type="target" :position="Position.Top" id="in-top" :style="{ left: '50%' }" />
      <!-- Bottom handle -->
      <Handle type="source" :position="Position.Bottom" id="out-bottom" :style="{ left: '50%' }" />
      <!-- Left handle -->
      <Handle type="target" :position="Position.Left" id="in-left" :style="{ top: '50%' }" />
      <!-- Right handle -->
      <Handle type="source" :position="Position.Right" id="out-right" :style="{ top: '50%' }" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const getIcon = () => {
  switch (props.data.type) {
    case 'option': return '⚙️'
    case 'action': return '🎯'
    case 'condition': return '🔍'
    default: return '📦'
  }
}

const getDefaultName = () => {
  switch (props.data.type) {
    case 'option': return 'Новая опция'
    case 'action': return 'Новое действие'
    case 'condition': return 'Новое условие'
    default: return 'Новый блок'
  }
}

const getDefaultDescription = () => {
  switch (props.data.type) {
    case 'option': return 'Настройте параметры команды'
    case 'action': return 'Выполните действие'
    case 'condition': return 'Проверьте условие'
    default: return 'Описание блока'
  }
}

const getOptionTypeLabel = () => {
  const typeMap = {
    'STRING': 'Строка',
    'USER': 'Пользователь',
    'CHANNEL': 'Канал'
  }
  return typeMap[props.data.optionType] || props.data.optionType
}

const getActionTypeLabel = () => {
  const typeMap = {
    'send_message': 'Сообщение',
    'send_to_channel': 'В канал',
    'delete_message': 'Удалить',
    'button': 'Кнопка',
    'edit_component': 'Редактировать',
    'send_form': 'Форма',
    'add_role': 'Роль',
    'resolve_placeholders': 'Плейсхолдеры',
    'send_page': 'Страница'
  }
  return typeMap[props.data.actionType] || props.data.actionType
}

const getConditionTypeLabel = () => {
  const typeMap = {
    'permission': 'Права',
    'chance': 'Шанс'
  }
  return typeMap[props.data.conditionType] || props.data.conditionType
}
</script>

<style scoped>
.custom-node {
  background: #404040;
  border: 2px solid #525252;
  border-radius: 12px;
  padding: 0;
  min-width: 280px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  position: relative;
}

.custom-node.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3);
}

.node-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px 10px 0 0;
  border-bottom: 1px solid #525252;
  min-height: 48px;
}

.node-header.type-option {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.node-header.type-action {
  background: linear-gradient(135deg, #10b981, #059669);
}

.node-header.type-condition {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.node-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.node-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  flex: 1;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.3;
}

.node-content {
  padding: 0.75rem 1rem;
}

.node-description {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: normal;
}

.node-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.75rem;
  word-wrap: break-word;
  white-space: normal;
}

.detail-label {
  color: #9ca3af;
  font-weight: 500;
}

.detail-value {
  color: #e5e7eb;
  font-weight: 600;
  word-wrap: break-word;
  white-space: normal;
  flex: 1;
}

.node-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border: 2px solid #ffffff;
  border-radius: 50%;
  pointer-events: all;
  cursor: crosshair;
  transition: all 0.2s ease;
}

.handle:hover {
  background: #2563eb;
  transform: scale(1.2);
}

.handle-top {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
}

.handle-bottom {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
}

.handle-left {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
}

.handle-right {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .custom-node {
    min-width: 240px;
    max-width: 320px;
  }
  
  .node-header {
    padding: 0.5rem 0.75rem;
  }
  
  .node-content {
    padding: 0.5rem 0.75rem;
  }
}
</style> 