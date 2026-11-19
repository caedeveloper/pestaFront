<script setup lang="ts">
// Widgets de ejemplo conservados hasta definir el inicio de admisión.
//
// /*Call Components*/
// import Topcards from '../dashboardComponents/modern/TopCards.vue';
// import RevenueUpdates from '../dashboardComponents/modern/RevenueUpdates.vue';
// import YearlyBreakup from '../dashboardComponents/modern/YearlyBreakup.vue';
// import MonthlyEarnings from '../dashboardComponents/modern/MonthlyEarnings.vue';
// import EmployeeSalary from '../dashboardComponents/modern/EmployeeSalary.vue';
// import Customers from '../dashboardComponents/modern/Customers.vue';
// import Projects from '../dashboardComponents/modern/Projects.vue';
// import UserCard from '../dashboardComponents/modern/UserCard.vue';
// import BestSellingProducts from '../dashboardComponents/modern/BestSellingProducts.vue';
// import WeeklyStats from '../dashboardComponents/modern/WeeklyStats.vue';
// import TopProjects from '../dashboardComponents/modern/TopProjects.vue';
// import SnackBar from '@/components/dashboards/snackbar.vue';
</script>

<template>
    <section aria-labelledby="inicio-title">
        <h1 id="inicio-title" class="text-display-small font-weight-semibold mb-2">Inicio</h1>
        <p class="text-body-large text-muted mb-6">Heinrich · Admisión</p>
        <v-card>
            <v-card-text class="pa-6">
                <h2 class="text-headline-medium mb-2">Bienvenido a Heinrich Admisión</h2>
                <p class="text-body-large text-textSecondary">Este será el espacio de trabajo para el proceso de admisión del Colegio Pestalozzi.</p>
            </v-card-text>
        </v-card>
    </section>
    <!-- Desactivado: demostración Modernize conservada para reutilización.
<SnackBar />
    

    <v-row>
        
        <v-col cols="12">
            <Topcards />
        </v-col>
        <v-col cols="12">
            <v-row>
                
                <v-col cols="12" lg="8" md="12">
                    <RevenueUpdates />
                </v-col>
                
                <v-col cols="12" lg="4" sm="12">
                    <v-row>
                        <v-col cols="12" lg="12" sm="6">
                            <YearlyBreakup />
                        </v-col>
                        <v-col cols="12" lg="12" sm="6">
                            <MonthlyEarnings />
                        </v-col>
                    </v-row>
                </v-col>
                
                <v-col cols="12" lg="4" md="4">
                    <EmployeeSalary />
                </v-col>
                
                <v-col cols="12" lg="4" md="4">
                    <v-row>
                        <v-col cols="12" sm="6">
                            <Customers />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <Projects />
                        </v-col>
                        <v-col cols="12">
                            <UserCard />
                        </v-col>
                    </v-row>
                </v-col>
                
                <v-col cols="12" lg="4" md="4">
                    <BestSellingProducts />
                </v-col>
                
                <v-col cols="12" lg="4" md="4">
                    <WeeklyStats />
                </v-col>
                
                <v-col cols="12" lg="8" md="8">
                    <TopProjects />
                </v-col>
            </v-row>
        </v-col>
    </v-row>
-->
</template>
