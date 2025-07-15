<template>
  <div class="workflow-editor">
    <div class="workflow-header">
      <input v-model="localCommand.name" class="command-title" placeholder="Command name..." />
      <input v-model="localCommand.description" class="command-desc" placeholder="Description..." />
      <button class="reset-btn" @click="resetWorkflow">Reset Command</button>
      <button class="save-btn" @click="$emit('save', localCommand)">Save</button>
      <button class="cancel-btn" @click="$emit('cancel')">Cancel</button>
    </div>
    <div class="workflow-canvas"
         @dragover.prevent
         @drop="onDropBlock">
      <ReactFlow
        :nodes="nodesWithSelection"
        :edges="edgesWithSelection"
        :onNodeClick="onNodeClick"
        :onEdgeClick="onEdgeClick"
        :nodeTypes="customNodeTypes"
        style="width:100%;height:600px;background:#23272b" />
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref, onMounted, onUnmounted, computed, shallowRef } from 'vue';
import ActionEditor from './ActionEditor.vue';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import { Handle, Position } from 'reactflow';

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
  console.log('Selected command:', val);
  Object.assign(localCommand, JSON.parse(JSON.stringify(val)));
  // Синхронизировать визуальные узлы и edges с данными команды
  const newNodes = [
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
  if (newNodes.length === 0) {
    newNodes.push({ id: 'empty', data: { label: 'Перетащите блок из панели слева' }, position: { x: 300, y: 200 } });
  }
  nodes.value = newNodes;
  if (localCommand._edges) {
    edges.value = localCommand._edges.map((e, i) => ({ id: `e${e.source}-${e.target}-${i}`, source: e.source, target: e.target }));
  } else {
    edges.value = [];
  }
  console.log('Nodes after update:', nodes.value);
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
const customNodeTypes = {
  option: shallowRef({
    render() {
      return h('div', { class: 'node option-node' }, [
        h('span', { class: 'node-icon' }, '🔤'),
        h('span', { class: 'node-label' }, this.data.label),
        h(Handle, { type: 'source', position: Position.Right }),
        h(Handle, { type: 'target', position: Position.Left })
      ]);
    }
  }),
  action: shallowRef({
    render() {
      return h('div', { class: 'node action-node' }, [
        h('span', { class: 'node-icon' }, '⚡'),
        h('span', { class: 'node-label' }, this.data.label),
        h(Handle, { type: 'source', position: Position.Right }),
        h(Handle, { type: 'target', position: Position.Left })
      ]);
    }
  }),
  condition: shallowRef({
    render() {
      return h('div', { class: 'node condition-node' }, [
        h('span', { class: 'node-icon' }, '❓'),
        h('span', { class: 'node-label' }, this.data.label),
        h(Handle, { type: 'source', position: Position.Right }),
        h(Handle, { type: 'target', position: Position.Left })
      ]);
    }
  })
};
function resetWorkflow() {
  nodes.value = [];
  edges.value = [];
}
const nodesWithSelection = computed(() => nodes.value.map(n => ({
  ...n,
  type: n.id.startsWith('opt') ? 'option' : n.id.startsWith('act') ? 'action' : n.id.startsWith('cond') ? 'condition' : undefined,
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
.workflow-editor {
  background: #23272b;
  border-radius: 10px;
  padding: 18px 18px 0 18px;
  margin-bottom: 24px;
  min-height: 700px;
}
.workflow-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}
.command-title {
  font-size: 1.3em;
  font-weight: 700;
  background: #181c20;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  min-width: 200px;
}
.command-desc {
  font-size: 1em;
  background: #181c20;
  color: #b9bbbe;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  min-width: 300px;
}
.reset-btn {
  background: #b71c1c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 1em;
  font-weight: 600;
  margin-left: auto;
  cursor: pointer;
}
.save-btn {
  background: #5865f2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
}
.cancel-btn {
  background: #444;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
}
.workflow-canvas {
  background: #23272b;
  border-radius: 10px;
  min-height: 600px;
  padding: 0;
  margin-bottom: 0;
  box-shadow: 0 2px 16px #0004;
  border: 2px solid #2e3338;
  position: relative;
  /* сетка с точками */
  background-image:
    radial-gradient(circle, #444 1px, transparent 1.5px),
    radial-gradient(circle, #444 1px, transparent 1.5px);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
}
.node {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 1.08em;
  font-weight: 600;
  box-shadow: 0 2px 8px #0002;
  background: #23272b;
  border: 2px solid #444;
}
.option-node { background: #2e3a59; color: #fff; border-color: #4dd0ff; }
.action-node { background: #2e593a; color: #fff; border-color: #4dff7f; }
.condition-node { background: #594a2e; color: #fff; border-color: #ffd700; }
.node-icon { font-size: 1.3em; margin-right: 6px; }
.node-label { font-size: 1.08em; }
</style> 