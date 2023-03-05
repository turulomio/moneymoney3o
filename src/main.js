
// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import 'flag-icons/css/flag-icons.min.css'

// Plugins
import { registerPlugins } from '@/plugins'
import vuetify from './plugins/vuetify'
import i18n from './i18n'
import { createPinia } from 'pinia';
import {router} from './routes.js'
import mixin from '@/mixin'

const app = createApp(App)

app.use(i18n)
app.use(createPinia())
app.use(router)
app.mixin(mixin)


registerPlugins(app)
app
  .use(vuetify)
  .mount('#app')
