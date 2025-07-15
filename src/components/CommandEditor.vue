<template>
  <div class="command-editor">
    <h3>{{ isNew ? 'Создать команду' : 'Редактировать команду' }}</h3>
    <div class="visual-editor"
         @dragover.prevent
         @drop="onDropBlock">
      <ReactFlow
        :nodes="nodesWithSelection"
        :edges="edgesWithSelection"
        :onNodeClick="onNodeClick"
        :onEdgeClick="onEdgeClick"
        style="width:100%;height:400px;background:#23272b" />
    </div>
    <div class="actions">
      <button @click="$emit('save', localCommand)">Сохранить</button>
      <button @click="$emit('cancel')">Отмена</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref, onMounted, onUnmounted, computed } from 'vue';
import ActionEditor from './ActionEditor.vue';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
const props = defineProps({
  command: Object,
  isNew: Boolean
});
const emit = defineEmits(['save', 'cancel']);
const localCommand = reactive(JSON.parse(JSON.stringify(props.command || {
  name: '', description: '', context: 'server', ephemeral: false,
  options: [], actions: [], conditions: []
})));
watch(() => props.command, (val) => {
  Object.assign(localCommand, JSON.parse(JSON.stringify(val)));
  // Синхронизировать визуальные узлы и edges с данными команды
  nodes.value = [
    ...(localCommand.options || []).map((opt, i) => ({
      id: `opt${i+1}`,
      data: { label: `Option: ${opt.name || opt.type}` },
      position: { x: 80, y: 60 + i*60 }
    })),
    ...(localCommand.actions || []).map((act, i) => ({
      id: `act${i+1}`,
      data: { label: `Action: ${act.type}` },
      position: { x: 320, y: 60 + i*60 }
    })),
    ...(localCommand.conditions || []).map((cond, i) => ({
      id: `cond${i+1}`,
      data: { label: `Condition: ${cond.type}` },
      position: { x: 560, y: 60 + i*60 }
    })),
  ];
  if (localCommand._edges) {
    edges.value = localCommand._edges.map((e, i) => ({ id: `e${e.source}-${e.target}-${i}`, source: e.source, target: e.target }));
  } else {
    edges.value = [];
  }
});
watch(nodes, (val) => {
  // Сохранять изменения в nodes обратно в localCommand
  localCommand.options = val.filter(n => n.id.startsWith('opt')).map(n => ({ name: n.data.label.replace(/^Option: /, ''), type: 'STRING' }));
  localCommand.actions = val.filter(n => n.id.startsWith('act')).map(n => ({ type: n.data.label.replace(/^Action: /, '') }));
  localCommand.conditions = val.filter(n => n.id.startsWith('cond')).map(n => ({ type: n.data.label.replace(/^Condition: /, '') }));
});
watch(edges, (val) => {
  localCommand._edges = val.map(e => ({ source: e.source, target: e.target }));
});
function addOption() {
  if (!localCommand.options) localCommand.options = [];
  localCommand.options.push({ name: '', type: 'STRING', description: '', required: false });
}
function removeOption(i) { localCommand.options.splice(i, 1); }
function addAction() {
  if (!localCommand.actions) localCommand.actions = [];
  localCommand.actions.push({ type: 'send_message', message: '' });
}
function removeAction(i) { localCommand.actions.splice(i, 1); }
function addCondition() {
  if (!localCommand.conditions) localCommand.conditions = [];
  localCommand.conditions.push({ type: 'permission', role_id: '' });
}
function removeCondition(i) { localCommand.conditions.splice(i, 1); }
const nodes = ref([
  { id: '1', type: 'input', data: { label: 'Start' }, position: { x: 100, y: 50 } },
  { id: '2', data: { label: 'Action: Send Message' }, position: { x: 300, y: 200 } },
  { id: '3', data: { label: 'Condition: Permission' }, position: { x: 500, y: 100 } },
]);
const edges = ref([
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
]);
function onDropBlock(event) {
  const data = event.dataTransfer.getData('block');
  if (!data) return;
  const block = JSON.parse(data);
  const id = (nodes.value.length + 1).toString();
  const pos = { x: event.offsetX || 200, y: event.offsetY || 200 };
  nodes.value.push({
    id,
    data: { label: `${block.kind.charAt(0).toUpperCase() + block.kind.slice(1)}: ${block.label}` },
    position: pos
  });
}
const selectedNodeId = ref(null);
const connectSourceId = ref(null);
const selectedEdgeId = ref(null);
const nodesWithSelection = computed(() => nodes.value.map(n => ({
  ...n,
  style: n.id === connectSourceId.value ? { border: '2px solid #4dd0ff' } : undefined
})));
const edgesWithSelection = computed(() => edges.value.map(e => ({
  ...e,
  style: e.id === selectedEdgeId.value ? { stroke: '#ff4d4d', strokeWidth: 3 } : undefined
})));
function onNodeClick(event, node) {
  if (!connectSourceId.value) {
    connectSourceId.value = node.id;
    selectedNodeId.value = node.id;
  } else if (connectSourceId.value && connectSourceId.value !== node.id) {
    // create edge
    const edgeId = `e${connectSourceId.value}-${node.id}`;
    if (!edges.value.find(e => e.id === edgeId)) {
      edges.value.push({ id: edgeId, source: connectSourceId.value, target: node.id });
    }
    connectSourceId.value = null;
    selectedNodeId.value = null;
  } else {
    connectSourceId.value = null;
    selectedNodeId.value = null;
  }
}
function onEdgeClick(event, edge) {
  selectedEdgeId.value = edge.id;
}
function onKeyDown(event) {
  if (event.key === 'Delete') {
    if (selectedNodeId.value) {
      nodes.value = nodes.value.filter(n => n.id !== selectedNodeId.value);
      edges.value = edges.value.filter(e => e.source !== selectedNodeId.value && e.target !== selectedNodeId.value);
      selectedNodeId.value = null;
    } else if (selectedEdgeId.value) {
      edges.value = edges.value.filter(e => e.id !== selectedEdgeId.value);
      selectedEdgeId.value = null;
    }
  }
}
onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<style scoped>
.command-editor {
  background: #23272b;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 24px;
  max-width: 600px;
}
form label {
  display: block;
  margin-bottom: 10px;
  color: #fff;
}
input, select {
  margin-left: 10px;
  margin-bottom: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  background: #181c20;
  color: #fff;
}
.section {
  margin: 16px 0;
}
.actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}
button {
  background: #5865f2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 1rem;
  cursor: pointer;
}
button[type="button"] {
  background: #444;
}
button:hover {
  background: #4752c4;
}
.visual-editor {
  margin-bottom: 24px;
  background: #23272b;
  border-radius: 10px;
  padding: 10px;
  min-height: 420px;
}
</style> 