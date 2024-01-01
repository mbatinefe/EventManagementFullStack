import './assets/main.css'
import VueApexCharts from "vue3-apexcharts";
import VueDatePicker from '@vuepic/vue-datepicker';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Oruga from '@oruga-ui/oruga-next';

import { bootstrapConfig } from '@oruga-ui/theme-bootstrap';

import '@oruga-ui/theme-bootstrap/dist/bootstrap.css';
import '@mdi/font/css/materialdesignicons.min.css';
import '@vuepic/vue-datepicker/dist/main.css'


// import 'bootstrap/dist/css/bootstrap.css'
import "bootstrap"

const app = createApp(App)

app.component('VueDatePicker', VueDatePicker);
app.use(router).use(Oruga, bootstrapConfig).use(VueApexCharts)

app.mount('#app')