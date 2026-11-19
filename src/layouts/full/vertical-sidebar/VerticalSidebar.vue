<script setup lang="ts">
import { shallowRef } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import { useDisplay } from 'vuetify';
import sidebarItems from './sidebarItem';

import NavGroup from './NavGroup/index.vue';
import NavItem from './NavItem/index.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';
import Profile from './profile/Profile.vue';
import Logo from '../logo/Logo.vue';
import RtlLogo from '../logo/RtlLogo.vue';

const { mdAndUp } = useDisplay();
const customizer = useCustomizerStore();
const sidebarMenu = shallowRef(sidebarItems);
</script>

<template>
    <v-navigation-drawer
        id="heinrich-sidebar"
        v-model="customizer.Sidebar_drawer"
        elevation="0"
        rail-width="76"
        :permanent="mdAndUp"
        :temporary="!mdAndUp"
        class="leftSidebar"
        :rail="customizer.mini_sidebar"
        width="296"
    >
        <!---Logo part -->
        <v-locale-provider  v-if="customizer.setRTLLayout"  rtl >
        <div class="sidebar-heading">
            <RtlLogo />
        </div>
        </v-locale-provider>
        <v-locale-provider  v-else>
        <div class="sidebar-heading">
            <Logo />
        </div>
        </v-locale-provider>

        
        <!-- ---------------------------------------------- -->
        <!---Navigation -->
        <!-- ---------------------------------------------- -->
        <perfect-scrollbar id="heinrich-navigation" class="scrollnavbar">
            <v-list class="pa-2" aria-label="Men? principal">
                <!---Menu Loop -->
                <template v-for="(item, i) in sidebarMenu">
                    <!---Item Sub Header -->
                    <NavGroup :item="item" v-if="item.header" :key="item.title" />
                    <!---If Has Child -->
                    <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
                    <!---Single Item-->
                    <NavItem :item="item" v-else class="leftPadding" />
                    <!---End Single Item-->
                </template>
            </v-list>
            <div class="pa-2 userbottom">
                <Profile />
            </div>
        </perfect-scrollbar>
    </v-navigation-drawer>
</template>
