<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <button class="close-btn" @click="$emit('close')">×</button>
      <h2>Изменения сохранены!</h2>
      <p>Выполните эту команду на сервере для применения изменений:</p>
      <div class="command-row">
        <code class="apply-edits" @click="copyCommand" :title="copied ? 'Скопировано!' : 'Скопировать'">
          /DiscordBMV applyedits {{ bytebinKey }}
        </code>
        <span v-if="copied" class="copied-label">Скопировано!</span>
      </div>
      <p class="note">После применения команды, для новых изменений получите новый код!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({ bytebinKey: String });
const emit = defineEmits(['close']);
const copied = ref(false);
function copyCommand() {
  navigator.clipboard.writeText(`/DiscordBMV applyedits ${props.bytebinKey}`);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
}
watch(() => props.bytebinKey, () => { copied.value = false; });
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box {
  background: #23272b;
  border-radius: 12px;
  padding: 2rem 2.5rem 2rem 2.5rem;
  min-width: 340px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.35);
  position: relative;
  color: #fff;
}
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #aaa;
  font-size: 2rem;
  cursor: pointer;
}
.close-btn:hover {
  color: #fff;
}
.apply-edits {
  font-size: 1.25rem;
  background: #181c20;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  user-select: all;
  transition: background 0.15s;
}
.apply-edits:hover {
  background: #3b82f6;
  color: #fff;
}
.command-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0 1rem 0;
}
.copied-label {
  color: #10b981;
  font-weight: 600;
  font-size: 1rem;
}
.note {
  color: #aaa;
  font-size: 0.95rem;
  margin-top: 1.5rem;
}
</style> 