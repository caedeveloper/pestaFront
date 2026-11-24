<script setup lang="ts">
import { computed, useSlots } from 'vue';
const props = withDefaults(defineProps<{ title?: string; subtitle?: string; icon?: string; loading?: boolean; contentPadding?: 'default' | 'none'; hideContent?: boolean; headerCardItemClass?: string; footerCardItemClass?: string }>(), { contentPadding: 'default', hideContent: false });
const slots = useSlots();
const hasHeader = computed(() => Boolean(props.title || props.subtitle || props.icon || slots.header || slots.action));
const hasFooter = computed(() => Boolean(slots.footer || slots['footer-actions']));
</script>
<template>
  <v-card class="ui-parent-card" elevation="10">
    <v-card-item v-if="hasHeader" :class="headerCardItemClass || 'ui-parent-card__header'"><slot name="header"><div class="d-sm-flex align-center justify-space-between"><v-card-title v-if="title" class="ui-parent-card__title"><v-icon v-if="icon" class="text-medium-emphasis me-2" size="20">{{ icon }}</v-icon>{{ title }}</v-card-title><slot name="action" /></div><v-card-subtitle v-if="subtitle" class="ui-parent-card__subtitle">{{ subtitle }}</v-card-subtitle></slot></v-card-item>
    <v-progress-linear v-if="loading" indeterminate height="3" color="primary" />
    <v-divider v-if="hasHeader" />
    <v-card-text v-if="!hideContent" :class="contentPadding === 'none' ? 'ui-parent-card__content--none' : 'ui-parent-card__content'"><slot /></v-card-text>
    <template v-if="hasFooter"><v-divider /><v-card-item :class="footerCardItemClass || 'ui-parent-card__footer'"><div class="d-sm-flex align-center justify-space-between"><slot name="footer" /><v-spacer v-if="!slots.footer || slots['footer-actions']" /><slot name="footer-actions" /></div></v-card-item></template>
  </v-card>
</template>
<style scoped>.ui-parent-card__header, .ui-parent-card__footer { padding: 1.875rem 1.875rem 1.5rem; }.ui-parent-card__content { padding: 1.875rem 1.875rem 1.5rem; }.ui-parent-card__content--none { padding: 0; }.ui-parent-card__title { font-size: 1.125rem; font-weight: 600; line-height: 1.6rem; }.ui-parent-card__subtitle { font-size: .875rem; font-weight: 400; line-height: 1.1rem; }</style>
