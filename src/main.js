import 'flag-icons/css/flag-icons.min.css'
import App from './App.vue'
import { createApp } from 'vue'
import { loadFonts } from '@/plugins/webfontloader'
import vuetify from '@/plugins/vuetify'
import i18n from './i18n'
import { createPinia } from 'pinia';
import {router} from './routes.js'
import mixin from '@/mixin'
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

document.title=import.meta.env.VITE_APP_TITLE

loadFonts()
const app = createApp(App)
app.use(i18n)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.component('EasyDataTable', Vue3EasyDataTable);
app.mixin(mixin)
app.mount('#app')


console.log(import.meta.env.MODE)