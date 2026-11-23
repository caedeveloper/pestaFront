<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

const props = withDefaults(defineProps<{ modelValue?: string; placeholder?: string }>(), { modelValue: '', placeholder: 'Escriba el contenido...' });
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const editor = useEditor({
  content: props.modelValue,
  extensions: [StarterKit, Underline, Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' })],
  editorProps: { attributes: { class: 'heinrich-editor__content', 'data-placeholder': props.placeholder } },
  onUpdate: ({ editor: current }) => emit('update:modelValue', current.getHTML())
});
watch(() => props.modelValue, (value) => {
  if (editor.value && value !== editor.value.getHTML()) editor.value.commands.setContent(value || '', { emitUpdate: false });
});
function setLink() {
  const previous = editor.value?.getAttributes('link').href || '';
  const url = window.prompt('Ingrese la URL del enlace', previous);
  if (url === null) return;
  if (!url) editor.value?.chain().focus().extendMarkRange('link').unsetLink().run();
  else editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}
onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
  <div class="heinrich-editor" :class="{ 'heinrich-editor--focused': editor?.isFocused }">
    <div class="heinrich-editor__toolbar" role="toolbar" aria-label="Herramientas de formato">
      <v-btn size="small" variant="text" icon="mdi-format-header-1" title="Título" :active="editor?.isActive('heading', { level: 2 })" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" />
      <v-btn size="small" variant="text" icon="mdi-format-paragraph" title="Párrafo" :active="editor?.isActive('paragraph')" @click="editor?.chain().focus().setParagraph().run()" />
      <v-divider vertical class="mx-1" />
      <v-btn size="small" variant="text" icon="mdi-format-bold" title="Negrita" :active="editor?.isActive('bold')" @click="editor?.chain().focus().toggleBold().run()" />
      <v-btn size="small" variant="text" icon="mdi-format-italic" title="Cursiva" :active="editor?.isActive('italic')" @click="editor?.chain().focus().toggleItalic().run()" />
      <v-btn size="small" variant="text" icon="mdi-format-underline" title="Subrayado" :active="editor?.isActive('underline')" @click="editor?.chain().focus().toggleUnderline().run()" />
      <v-btn size="small" variant="text" icon="mdi-format-list-bulleted" title="Lista" :active="editor?.isActive('bulletList')" @click="editor?.chain().focus().toggleBulletList().run()" />
      <v-btn size="small" variant="text" icon="mdi-link" title="Enlace" :active="editor?.isActive('link')" @click="setLink" />
      <v-spacer />
      <v-btn size="small" variant="text" icon="mdi-undo" title="Deshacer" :disabled="!editor?.can().undo()" @click="editor?.chain().focus().undo().run()" />
      <v-btn size="small" variant="text" icon="mdi-redo" title="Rehacer" :disabled="!editor?.can().redo()" @click="editor?.chain().focus().redo().run()" />
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<style scoped>
.heinrich-editor { border: 1px solid rgb(var(--v-theme-borderColor)); border-radius: 8px; overflow: hidden; background: rgb(var(--v-theme-surface)); }
.heinrich-editor--focused { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)); }
.heinrich-editor__toolbar { display: flex; align-items: center; flex-wrap: wrap; padding: 5px 8px; border-bottom: 1px solid rgb(var(--v-theme-borderColor)); background: rgb(var(--v-theme-light)); }
:deep(.heinrich-editor__content) { min-height: 160px; padding: 14px 16px; outline: none; }
:deep(.heinrich-editor__content p.is-editor-empty:first-child::before) { content: attr(data-placeholder); float: left; color: rgba(var(--v-theme-on-surface), .5); pointer-events: none; height: 0; }
:deep(.heinrich-editor__content p), :deep(.heinrich-editor__content ul) { margin: 0 0 10px; }
:deep(.heinrich-editor__content a) { color: rgb(var(--v-theme-primary)); text-decoration: underline; }
</style>
