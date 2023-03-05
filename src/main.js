
// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import 'flag-icons/css/flag-icons.min.css'

// Plugins
import { registerPlugins } from '@/plugins'
import vuetify from './plugins/vuetify'
import i18n from './i18n'
import mixin from './mixin'
import { createPinia } from 'pinia';  
import {useStore} from './store.js'
import {router} from './routes.js'
const app = createApp(App)

app.use(i18n)
app.use(createPinia())
app.use(router)


app.mixin(mixin)
registerPlugins(app)

const store=useStore

app
  .use(vuetify)
  .mount('#app')

