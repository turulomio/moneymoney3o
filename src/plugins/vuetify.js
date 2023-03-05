/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
// Vuetify

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    }
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#186718',
          secondary: '#5CBBF6',
        },
      },
    },
  },
})

export default vuetify;
