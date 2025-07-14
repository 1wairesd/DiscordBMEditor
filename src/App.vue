<template>
  <div class="layout">
    <VisualCommandBuilder />
  </div>
</template>

<script setup>
import VisualCommandBuilder from './components/VisualCommandBuilder.vue';
</script>

<style>
body {
  font-family: system-ui, sans-serif;
  background: #181c20;
  color: #fff;
  margin: 0;
}
.layout {
  display: flex;
  min-height: 100vh;
}
</style> 