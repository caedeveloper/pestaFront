<script setup lang="ts">
import { ref } from 'vue';
import {topProjectsData} from '@/_mockApis/components/dashboard/modernData'
const select = ref('March 2026');
const items = ref(['March 2026', 'April 2026', 'May 2026']);
</script>
<template>
    <v-card elevation="10" >
        <v-card-item>
            <div class="d-sm-flex align-center justify-space-between">
                <div>
                    <v-card-title class="text-headline-medium">Top Projects</v-card-title>
                    <v-card-subtitle class="text-title-large textSecondary">Best Products</v-card-subtitle>
                </div>
                <div class="my-sm-0 my-2">
                    <v-select v-model="select" :items="items" variant="outlined" density="compact" hide-details></v-select>
                </div>
            </div>
            <v-table class="month-table mt-6">
                <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-title-large textPrimary font-weight-semibold">Assigned</th>
                            <th class="text-title-large textPrimary font-weight-semibold">Project</th>
                            <th class="text-title-large textPrimary font-weight-semibold">Priority</th>
                            <th class="text-title-large textPrimary font-weight-semibold">Budget</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in topProjectsData" :key="item.leadname" :class="item.activestate" class="month-item">
                            <td>
                                <div class="d-flex align-center">
                                    <v-avatar size="40">
                                        <img :src="item.img" :alt="item.img" width="40"
                                    /></v-avatar>
                                    <div class="mx-3">
                                        <h4 class="text-title-large text-no-wrap font-weight-semibold"> {{ item.leadname }}</h4>
                                        <h6 class="text-title-medium text-no-wrap textSecondary mt-1">{{item.designation}}</h6>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <h5 class="text-no-wrap text-body-large">
                                    {{ item.projectname }}
                                </h5>
                            </td>
                            <td>
                                <v-chip rounded="md" class="ma-2 font-weight-semibold" :color="item.statuscolor" size="small" label>{{ item.statustext }}</v-chip>
                            </td>
                            <td>
                                <h4 class="text-body-large">{{ item.money }}</h4>
                            </td>
                        </tr>
                    </tbody>
                </template>
            </v-table>
        </v-card-item>
    </v-card>
</template>
