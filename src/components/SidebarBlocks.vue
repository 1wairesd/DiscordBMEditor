<template>
  <div class="sidebar-blocks">
    <div class="tabs">
      <button :class="{active: tab==='options'}" @click="tab='options'">Options</button>
      <button :class="{active: tab==='actions'}" @click="tab='actions'">Actions</button>
      <button :class="{active: tab==='conditions'}" @click="tab='conditions'">Conditions</button>
    </div>
    <div class="blocks-list">
      <template v-if="tab==='options'">
        <div v-for="block in optionsBlocks" :key="block.type" class="block-item" draggable="true" @dragstart="onDragStart(block, 'option')">
          <span class="block-title">{{ block.label }}</span>
          <span class="block-desc">{{ block.desc }}</span>
        </div>
      </template>
      <template v-else-if="tab==='actions'">
        <div v-for="block in actionsBlocks" :key="block.type" class="block-item" draggable="true" @dragstart="onDragStart(block, 'action')">
          <span class="block-title">{{ block.label }}</span>
          <span class="block-desc">{{ block.desc }}</span>
        </div>
      </template>
      <template v-else>
        <div v-for="block in conditionsBlocks" :key="block.type" class="block-item" draggable="true" @dragstart="onDragStart(block, 'condition')">
          <span class="block-title">{{ block.label }}</span>
          <span class="block-desc">{{ block.desc }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const tab = ref('options');
const optionsBlocks = [
  { type: 'STRING', label: 'String Option', desc: 'Text input from user' },
  { type: 'USER', label: 'User Option', desc: 'Select a user' },
  { type: 'CHANNEL', label: 'Channel Option', desc: 'Select a channel' },
  { type: 'ROLE', label: 'Role Option', desc: 'Select a role' },
  { type: 'BOOLEAN', label: 'Boolean Option', desc: 'Yes/No input' },
  { type: 'INTEGER', label: 'Integer Option', desc: 'Number input' },
];
const actionsBlocks = [
  { type: 'send_message', label: 'Send or Edit a Message', desc: 'Send or edit a message with optional buttons' },
  { type: 'plain_reply', label: 'Plain Text Reply', desc: 'Reply with plain text' },
  { type: 'embed_reply', label: 'Embed Reply', desc: 'Reply with an embed' },
  { type: 'random_reply', label: 'Random Reply', desc: 'Reply with a random response' },
  { type: 'send_to_channel', label: 'Send to Channel', desc: 'Send a message to a channel' },
];
const conditionsBlocks = [
  { type: 'permission', label: 'Permission Condition', desc: 'Check user permission/role' },
  { type: 'chance', label: 'Chance Condition', desc: 'Random chance' },
];
function onDragStart(block, kind) {
  event.dataTransfer.setData('block', JSON.stringify({ ...block, kind }));
}
</script>

<style scoped>
.sidebar-blocks {
  background: #23272b;
  border-radius: 10px;
  padding: 16px;
  width: 260px;
  min-width: 220px;
  margin-bottom: 24px;
  color: #fff;
}
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.tabs button {
  flex: 1;
  background: #181c20;
  color: #fff;
  border: none;
  border-radius: 6px 6px 0 0;
  padding: 8px 0;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.15s;
}
.tabs button.active {
  background: #5865f2;
}
.blocks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.block-item {
  background: #2c3136;
  border-radius: 6px;
  padding: 10px 12px;
  cursor: grab;
  margin-bottom: 2px;
  transition: background 0.15s;
  border: 1px solid #3335;
}
.block-item:hover {
  background: #3a3f45;
}
.block-title {
  font-weight: 700;
  font-size: 1.05em;
  display: block;
}
.block-desc {
  color: #b9bbbe;
  font-size: 0.97em;
  margin-top: 2px;
  display: block;
}
</style> 