<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import React from 'react'
import ReactDOM from 'react-dom/client'
import BlockSidebar from './BlockSidebar.react.jsx'

const props = defineProps({
  node: Object,
  isRoot: Boolean,
})
const emit = defineEmits(['update:node', 'delete'])

const container = ref(null)
let root = null

const renderReact = () => {
  if (container.value) {
    if (!root) root = ReactDOM.createRoot(container.value)
    root.render(
      React.createElement(BlockSidebar, {
        node: props.node,
        isRoot: props.isRoot,
        onChange: (n) => emit('update:node', n),
        onDelete: () => emit('delete'),
      })
    )
  }
}

onMounted(renderReact)
watch(() => [props.node, props.isRoot], renderReact)
onBeforeUnmount(() => {
  if (root) root.unmount()
})
</script>

<template>
  <div ref="container"></div>
</template> 