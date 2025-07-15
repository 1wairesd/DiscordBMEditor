<template>
  <div class="modal-backdrop" v-if="visible">
    <div class="modal-content">
      <button class="close-btn" @click="close">×</button>
      <h2>Данные были сохранены.</h2>
      <p>Выполните эту команду на вашем сервере для применения изменений:</p>
      <pre class="command" @click="copyCommand" :title="copied ? 'Скопировано!' : 'Кликните для копирования'">
        /discordbmv applyedits {{ code }}
        <span v-if="copied" class="copied">Скопировано!</span>
      </pre>
      <p class="note">
        <b>Заметка:</b> после выполнения команды <code>applyedits</code>, вам нужно сгенерировать другой URL для продолжения работы над Данными.
      </p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
const props = defineProps({ visible: Boolean, code: String });
const emit = defineEmits(['close']);
const copied = ref(false);
function close() { emit('close'); }
async function copyCommand() {
  await navigator.clipboard.writeText(`/discordbmv applyedits ${props.code}`);
  copied.value = true;
  setTimeout(() => copied.value = false, 1200);
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content {
  background: #181a1b; color: #fff; padding: 2rem 2.5rem; border-radius: 12px; box-shadow: 0 8px 32px #000a;
  min-width: 350px; max-width: 90vw; text-align: center; position: relative;
}
.close-btn {
  position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;
}
.command {
  background: #23272a; color: #8aff80; padding: 0.7em 1em; border-radius: 6px; font-size: 1.1em; margin: 1em 0;
  user-select: all;
  cursor: pointer;
  position: relative;
}
.command:hover {
  background: #2e3338;
  opacity: 0.95;
}
.note {
  color: #aaa; font-size: 0.95em; margin-top: 1.5em;
}
.copied {
  color: #8aff80;
  margin-left: 12px;
  font-size: 0.95em;
  font-weight: 500;
  transition: opacity 0.2s;
}
</style> 