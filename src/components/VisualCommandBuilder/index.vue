<template>
  <div class="visual-command-builder">
    <Header
      :can-undo="canUndo"
      :can-redo="canRedo"
      @undo="undo"
      @redo="redo"
    >
      <MenuDropdown
        @save-schema="saveSchema"
        @load-schema="loadSchema"
        @export-yaml="exportYaml"
        @show-preview="showPreview = true"
      />
    </Header>
    <div class="main-content">
      <Palette />
      <Canvas />
      <PropertiesSidebar />
      <PreviewModal v-if="showPreview" @close="showPreview = false" />
    </div>
  </div>
</template>

<script setup>
// Здесь будут импорты и логика composable
import { ref } from 'vue'
import Header from './Header.vue'
import MenuDropdown from './MenuDropdown.vue'
import Palette from './Palette.vue'
import Canvas from './Canvas.vue'
import PropertiesSidebar from './PropertiesSidebar.vue'
import PreviewModal from './PreviewModal.vue'

const showPreview = ref(false)
// ...другие состояния и методы будут импортироваться из composable
const canUndo = ref(false)
const canRedo = ref(false)
function undo() {}
function redo() {}
function saveSchema() {}
function loadSchema() {}
function exportYaml() {}
</script>

<style scoped>
.visual-command-builder {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: #ffffff;
}
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-width: 0;
}
</style> 