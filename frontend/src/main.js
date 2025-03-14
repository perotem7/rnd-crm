import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import { useAuthStore } from './stores/auth'
import axios from 'axios'

// API URL from env variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Setup axios defaults
axios.defaults.baseURL = API_URL;

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: () => import('./views/Analytics.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/products',
      name: 'Products',
      component: () => import('./views/Products.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/customers',
      name: 'Customers',
      component: () => import('./views/Customers.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('./views/Settings.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('./views/Login.vue'),
      meta: { guest: true }
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('./views/Signup.vue'),
      meta: { guest: true }
    },
    {
      path: '/auth-callback',
      name: 'AuthCallback',
      component: () => import('./views/AuthCallback.vue'),
      meta: { guest: true }
    }
  ]
})

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // If not authenticated but has token, try to fetch user
  if (!authStore.isAuthenticated && authStore.token) {
    await authStore.fetchUser();
  }
  
  // Handle authentication requirements
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (authStore.isAuthenticated) {
      next({ name: 'Home' });
    } else {
      next();
    }
  } else {
    next();
  }
});

// Create pinia store
const pinia = createPinia()

// Create and mount app
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
