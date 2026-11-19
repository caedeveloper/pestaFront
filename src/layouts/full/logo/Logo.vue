<script setup>
// Variantes de logo de Modernize conservadas; usamos la identidad del WebFront.
//
// import { computed } from "vue";
// import LogoLight from "./LogoLight.vue";
// import LogoDark from "./LogoDark.vue";
// import { useCustomizerStore } from "@/stores/customizer";
//
// const customizer = useCustomizerStore();
//
// //const dark = ref(false);
// const dark = computed(() => {
//   if (
//     customizer.actTheme === "DARK_BLUE_THEME" ||
//     customizer.actTheme === "DARK_AQUA_THEME" ||
//     customizer.actTheme === "DARK_ORANGE_THEME" ||
//     customizer.actTheme === "DARK_PURPLE_THEME" ||
//     customizer.actTheme === "DARK_GREEN_THEME" ||
//     customizer.actTheme === "DARK_CYAN_THEME"
//   ) {
//     return true;
//   } else {
//     return false;
//   }
// });
//
//
</script>
<template>
    <div class="logo">
        <RouterLink to="/" aria-label="Heinrich: inicio">
            <img src="@/assets/images/logos/logo-heinrich-500-nr2.svg" height="45" alt="Heinrich" />
        </RouterLink>
    </div>
    <!-- <LogoLight v-if="dark" /><LogoDark v-else /> -->
</template>
