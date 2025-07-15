<script setup>
import { defineProps, defineEmits } from 'vue';
import { ReactWrapper } from 'vue3-react-wrapper';
import BlockSidebar from './BlockSidebar.react.jsx';

const props = defineProps({
  node: Object,
  isRoot: Boolean,
});
const emit = defineEmits(['update:node', 'delete']);

const handleChange = (updatedNode) => {
  emit('update:node', updatedNode);
};
const handleDelete = () => {
  emit('delete');
};
</script>

<template>
  <ReactWrapper
    :component="BlockSidebar"
    :node="node"
    :isRoot="isRoot"
    :onChange="handleChange"
    :onDelete="handleDelete"
  />
</template> 