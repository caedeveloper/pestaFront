<template>
  <RouterView />
  <AppNotification />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import AppNotification from '@/components/notification/AppNotification.vue';
</script>
