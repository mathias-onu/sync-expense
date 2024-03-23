import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import 'primevue/resources/themes/lara-dark-cyan/theme.css'
import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [{ path: '/', component: App}]

const app = createApp(App)
const router = createRouter({ 
    history: createWebHistory(),
    routes 
})

app.use(PrimeVue)
app.use(router)
app.component('Dropdown', Dropdown)
app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Button', Button)

app.mount('#app');
