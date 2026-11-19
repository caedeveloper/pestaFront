<script setup lang="ts">
import { useDisplay } from 'vuetify';
import { Menu2Icon } from 'vue-tabler-icons';
import { useCustomizerStore } from '@/stores/customizer';
import ProfileDD from './ProfileDD.vue';
const customizer = useCustomizerStore();
const { mdAndUp } = useDisplay();

// Ejemplo original desactivado; se conserva para reutilización.
//
// import { ref, watch, computed } from 'vue';
// import { useCustomizerStore } from '../../../stores/customizer';
// import { useEcomStore } from '@/stores/apps/eCommerce';
// import { GridDotsIcon, LanguageIcon, SearchIcon, Menu2Icon, BellRingingIcon, ShoppingCartIcon } from 'vue-tabler-icons';
// import LanguageDD from './LanguageDD.vue';
// import NotificationDD from './NotificationDD.vue';
// import ProfileDD from './ProfileDD.vue';
// import Searchbar from './Searchbar.vue';
// import RightMobileSidebar from './RightMobileSidebar.vue';
// import Navigations from './Navigations.vue';
// import ThemeToggler from './ThemeToggler.vue';
//
// const customizer = useCustomizerStore();
// const showSearch = ref(false);
// const appsdrawer = ref(false);
// const priority = ref(customizer.setHorizontalLayout ? 0 : 0);
// function searchbox() {
//     showSearch.value = !showSearch.value;
// }
// watch(priority, (newPriority) => {
//     priority.value = newPriority;
// });
//
// // count items
// const store = useEcomStore();
// const getCart = computed(() => {
//     return store.cart;
// });
</script>

<template>
    <v-app-bar elevation="0" height="70" id="top">
        <v-btn v-if="mdAndUp" icon color="primary" variant="text" class="sidebar-header-control"
            :aria-label="customizer.mini_sidebar ? 'Expandir menú' : 'Contraer menú'"
            :aria-expanded="!customizer.mini_sidebar" aria-controls="heinrich-navigation"
            @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)">
            <Menu2Icon size="20" stroke-width="1.5" />
        </v-btn>
        <v-btn v-else icon variant="text" class="sidebar-header-control" aria-label="Abrir menú"
            :aria-expanded="!!customizer.Sidebar_drawer" aria-controls="heinrich-sidebar"
            @click.stop="customizer.SET_SIDEBAR_DRAWER">
            <Menu2Icon size="20" stroke-width="1.5" />
        </v-btn>
        <v-spacer />
        <div class="ml-2"><ProfileDD /></div>
    </v-app-bar>
    <!-- Demostración original desactivada.
<v-app-bar elevation="0" :priority="priority" height="70" id="top" class="">
        <v-btn
            class="hidden-md-and-down"
            icon
            color="primary"
            variant="text"
            @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)"
        >
            <Menu2Icon size="20" stroke-width="1.5" />
        </v-btn>
        <v-btn class="hidden-lg-and-up" icon variant="flat" @click.stop="customizer.SET_SIDEBAR_DRAWER" size="small">
            <Menu2Icon size="20" stroke-width="1.5" />
        </v-btn>

        
        
        
        <v-sheet>
            <Searchbar />
        </v-sheet>

        

        
        
        
        <div class="hidden-md-and-down">
            <Navigations />
        </div>
        <v-spacer />
        
        
        
        
        
        
        <div class="me-2">
            <ThemeToggler />
        </div>
        <div class="me-2">
            <LanguageDD />
        </div>
        
        
        
        <div class="me-2">
            <v-btn icon variant="text" color="primary" to="/ecommerce/checkout" class="custom-hover-primary" size="small">
                <v-badge color="error" :content="getCart?.length">
                    <ShoppingCartIcon stroke-width="1.5" size="22" />
                </v-badge>
            </v-btn>
        </div>

        
        
        
        <NotificationDD />

        
        <v-btn variant="text" color="primary" class="hidden-lg-and-up" icon @click.stop="appsdrawer = !appsdrawer">
            <GridDotsIcon size="17" stroke-width="1.5" />
        </v-btn>

        
        
        
        <div class="ml-2">
            <ProfileDD />
        </div>
    </v-app-bar>

    
    
    
    <v-navigation-drawer v-model="appsdrawer" location="right" temporary>
        <RightMobileSidebar />
    </v-navigation-drawer>
    -->
</template>
