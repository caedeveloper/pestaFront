<script setup lang="ts">
import { ref } from "vue";
const headings = ref([
    ['h1.Heading', 'text-display-large','font size: 30 | line-height: 45 | font weight: 500'],
    ['h2.Heading', 'text-display-medium','font size: 24 | line-height: 36 | font weight: 500'],
    ['h3.Heading', 'text-display-small','font size: 21 | line-height: 31.5 | font weight: 500'],
    ['h4.Heading', 'text-headline-large','font size: 18 | line-height: 27 | font weight: 500'],
    ['h5.Heading', 'text-headline-medium','font size: 16 | line-height: 24 | font weight: 500'],
    ['h6.Heading', 'text-headline-small','font size: 14 | line-height: 21 | font weight: 500'],
]);   

const subtext = ref(
    [
        ['Subtitle 1.', 'text-title-large',' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur','font size: 16 | line-height: 28 | font weight: 400'],
        ['Subtitle 2.', 'text-title-medium',' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur','font size: 14 | line-height: 21 | font weight: 400'],
        ['Body 1.', 'text-body-large',' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur','font size: 16 | line-height: 24 | font weight: 400'],
        ['Body 2.', 'text-body-medium',' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur','font size: 14 | line-height: 20 | font weight: 400'],
        ['Caption.', 'text-body-small',' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur','font size: 12 | line-height: 19 | font weight: 400'],
        ['OVERLINE.', 'text-label-medium letter-spacing-0',' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur','font size: 12 | line-height: 31 | font weight: 400']
    ]
)
</script>
<template>
    <div class="d-flex flex-column gap-1">
        <v-card variant="outlined" v-for="[name, cls,val] in headings" :key="name" class="my-3 pa-6">
            <div :class="[cls, '']">{{ name }}</div>
            <div class="text-body-small ">
                <div class="font-weight-medium">{{ val }}</div>
            </div>
        </v-card>
    </div>

    <div class="d-flex flex-column gap-1">
        <v-card variant="outlined" v-for="[name1, cls1,val1,prop] in subtext" :key="name1" class="my-3 pa-6">
            <div :class="[cls1, '']">{{ name1 }} <span>{{ val1 }}</span></div>
            <div class="text-body-small ">
                <div class="text-body-large">{{ prop }}</div>
            </div>
        </v-card>
    </div>
</template>
