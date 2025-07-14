<template>
  <div class="visual-layout">
    <aside class="palette">
      <h3>Blocks</h3>
      <div class="block-group">
        <div class="block-title">Options</div>
        <div class="block-item" draggable @dragstart="onDrag('option')">Option</div>
      </div>
      <div class="block-group">
        <div class="block-title">Actions</div>
        <div class="block-item" draggable @dragstart="onDrag('action')">Action</div>
      </div>
      <div class="block-group">
        <div class="block-title">Conditions</div>
        <div class="block-item" draggable @dragstart="onDrag('condition')">Condition</div>
      </div>
    </aside>
    <main class="canvas">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :fit-view-on-init="true"
        @drop="onDrop"
        @dragover.prevent
        style="height: 80vh; background: #23272b; border-radius: 12px;"
      />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { VueFlow } from '@vue-flow/core';
const nodes = ref([
  { id: '1', label: 'Start', position: { x: 250, y: 100 }, type: 'input' }
]);
const edges = ref([]);
function onDrag(type) {
  event.dataTransfer.setData('block-type', type);
}
function onDrop(event) {
  const type = event.dataTransfer.getData('block-type');
  const bounds = event.target.getBoundingClientRect();
  const position = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top
  };
  const id = (nodes.value.length + 1).toString();
  nodes.value.push({ id, label: type.charAt(0).toUpperCase() + type.slice(1), position });
}
</script>

<style scoped>
.visual-layout {
  display: flex;
  height: 90vh;
}
.palette {
  width: 220px;
  background: #202225;
  border-right: 1.5px solid #23272b;
  padding: 24px 12px 12px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.block-group {
  margin-bottom: 18px;
}
.block-title {
  color: #b9bbbe;
  font-size: 1.05em;
  margin-bottom: 6px;
  font-weight: 600;
}
.block-item {
  background: #23272b;
  color: #fff;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 6px;
  cursor: grab;
  font-size: 1em;
  box-shadow: 0 2px 8px #0002;
  transition: background 0.2s;
}
.block-item:hover {
  background: #5865f2;
}
.canvas {
  flex: 1;
  padding: 24px;
  min-width: 0;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
}
</style> 