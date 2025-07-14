<template>
  <div class="action-editor">
    <select v-model="action.type">
      <option value="send_message">send_message</option>
      <option value="button">button</option>
      <option value="edit_component">edit_component</option>
      <option value="delete_message">delete_message</option>
      <option value="send_form">send_form</option>
      <option value="add_role">add_role</option>
      <option value="send_to_channel">send_to_channel</option>
      <option value="send_page">send_page</option>
      <option value="resolve_placeholders">resolve_placeholders</option>
      <option value="embed">embed</option>
    </select>
    <!-- send_message -->
    <template v-if="action.type === 'send_message'">
      <input v-model="action.message" placeholder="message" />
      <div>
        <label>embed:</label>
        <button type="button" @click="addEmbed" v-if="!action.embed">+ embed</button>
        <div v-if="action.embed" class="embed-block">
          <input v-model="action.embed.title" placeholder="embed.title" />
          <input v-model="action.embed.description" placeholder="embed.description" />
          <input v-model="action.embed.color" placeholder="embed.color" />
          <input v-model="action.embed.footer" placeholder="embed.footer" />
          <button type="button" @click="removeEmbed">🗑️ embed</button>
          <div>
            <label>fields:</label>
            <button type="button" @click="addField">+ field</button>
            <ul>
              <li v-for="(f, i) in action.embed.fields" :key="i">
                <input v-model="f.name" placeholder="name" />
                <input v-model="f.value" placeholder="value" />
                <input type="checkbox" v-model="f.inline" /> inline
                <button type="button" @click="removeField(i)">🗑️</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>
    <!-- resolve_placeholders -->
    <template v-if="action.type === 'resolve_placeholders'">
      <input v-model="action.template" placeholder="template" />
      <input v-model="action.player" placeholder="player" />
    </template>
    <!-- button -->
    <template v-if="action.type === 'button'">
      <input v-model="action.label" placeholder="label" />
      <input v-model="action.style" placeholder="style" />
      <input v-model="action.id" placeholder="id" />
      <input v-model="action.message" placeholder="message" />
    </template>
    <!-- edit_component -->
    <template v-if="action.type === 'edit_component'">
      <input v-model="action.target_message" placeholder="target_message" />
      <input v-model="action.component_id" placeholder="component_id" />
      <input v-model="action.label" placeholder="label" />
      <input v-model="action.style" placeholder="style" />
      <input type="checkbox" v-model="action.disabled" /> disabled
    </template>
    <!-- send_form -->
    <template v-if="action.type === 'send_form'">
      <input v-model="action.form_name" placeholder="form_name" />
    </template>
    <!-- add_role -->
    <template v-if="action.type === 'add_role'">
      <input v-model="action.role_id" placeholder="role_id" />
    </template>
    <!-- send_to_channel -->
    <template v-if="action.type === 'send_to_channel'">
      <input v-model="action.message" placeholder="message" />
      <input v-model="action.label" placeholder="label" />
      <div>
        <label>embed:</label>
        <button type="button" @click="addEmbed" v-if="!action.embed">+ embed</button>
        <div v-if="action.embed" class="embed-block">
          <input v-model="action.embed.title" placeholder="embed.title" />
          <input v-model="action.embed.description" placeholder="embed.description" />
          <input v-model="action.embed.color" placeholder="embed.color" />
          <input v-model="action.embed.footer" placeholder="embed.footer" />
          <button type="button" @click="removeEmbed">🗑️ embed</button>
          <div>
            <label>fields:</label>
            <button type="button" @click="addField">+ field</button>
            <ul>
              <li v-for="(f, i) in action.embed.fields" :key="i">
                <input v-model="f.name" placeholder="name" />
                <input v-model="f.value" placeholder="value" />
                <input type="checkbox" v-model="f.inline" /> inline
                <button type="button" @click="removeField(i)">🗑️</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>
    <!-- send_page -->
    <template v-if="action.type === 'send_page'">
      <input v-model="action.page_id" placeholder="page_id" />
    </template>
    <!-- delete_message -->
    <template v-if="action.type === 'delete_message'">
      <input v-model="action.label" placeholder="label" />
      <input type="checkbox" v-model="action.delete_all" /> delete_all
      <input v-model="action.response_message" placeholder="response_message" />
    </template>
    <!-- edit_component, embed, другие типы можно расширять по мере необходимости -->
    <button type="button" class="delete-action" @click="$emit('delete')">🗑️</button>
  </div>
</template>

<script setup>
const props = defineProps({ action: Object });
const emit = defineEmits(['delete']);
function addEmbed() {
  props.action.embed = { title: '', description: '', color: '', footer: '', fields: [] };
}
function removeEmbed() {
  props.action.embed = undefined;
}
function addField() {
  if (!props.action.embed.fields) props.action.embed.fields = [];
  props.action.embed.fields.push({ name: '', value: '', inline: false });
}
function removeField(i) {
  props.action.embed.fields.splice(i, 1);
}
</script>

<style scoped>
.action-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  background: #23272b;
  border-radius: 8px;
  padding: 10px 8px;
}
input, select {
  background: #181c20;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  margin-right: 4px;
}
.embed-block {
  background: #181c20;
  border-radius: 6px;
  padding: 8px;
  margin: 4px 0;
}
.delete-action {
  background: #444;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
}
.delete-action:hover {
  background: #ff4d4d;
}
</style> 