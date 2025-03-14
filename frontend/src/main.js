import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: () => import('./views/Analytics.vue')
    },
    {
      path: '/projects',
      name: 'Projects',
      component: () => import('./views/Projects.vue')
    },
    {
      path: '/customers',
      name: 'Customers',
      component: () => import('./views/Customers.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('./views/Settings.vue')
    }
  ]
})

// Create pinia store
const pinia = createPinia()

// Create and mount app
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
