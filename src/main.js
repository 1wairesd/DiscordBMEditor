import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import { createI18n } from 'vue-i18n';
import messages from './messages';

const savedLang = localStorage.getItem('language');
const browserLang = navigator.language.split('-')[0];
const defaultLang = 'en';

const i18n = createI18n({
  legacy: false,
  locale: savedLang || browserLang || defaultLang,
  fallbackLocale: defaultLang,
  messages,
});

createApp(App).use(i18n).mount('#app'); 