<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Computed property to get the current route path
const currentPath = computed(() => route.path);

// Computed property to check if the user is on an auth page
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/signup' || route.path === '/auth-callback';
});

// Logout function
const logout = () => {
  authStore.logout();
  router.push('/login');
};

// Login function
const login = () => {
  router.push('/login');
};

// Fetch user data on component mount
onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser();
  }
});
</script>

<template>
  <div class="app">
    <!-- Sidebar - Only show if not on auth pages -->
    <div v-if="!isAuthPage" class="sidebar">
      <div class="logo">R&D CRM</div>
      <nav class="nav-menu">
        <div class="nav-item" :class="{ active: currentPath === '/' }">
          <router-link to="/">Dashboard</router-link>
        </div>
        <div class="nav-item" :class="{ active: currentPath === '/analytics' }">
          <router-link to="/analytics">Analytics</router-link>
        </div>
        <div class="nav-item" :class="{ active: currentPath === '/projects' }">
          <router-link to="/projects">Projects</router-link>
        </div>
        <div class="nav-item" :class="{ active: currentPath === '/customers' }">
          <router-link to="/customers">Customers</router-link>
        </div>
        <div class="nav-item" :class="{ active: currentPath === '/settings' }">
          <router-link to="/settings">Settings</router-link>
        </div>
      </nav>
      
      <!-- User Profile Section -->
      <div class="user-profile">
        <div v-if="authStore.isAuthenticated" class="user-profile-authenticated">
          <div class="user-avatar" :class="{ 'default-avatar': !authStore.user?.avatar }">
            <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" alt="User Avatar" />
            <span v-else class="user-icon">👤</span>
          </div>
          <div class="user-info">
            <div class="user-name">{{ authStore.user?.name || 'User' }}</div>
            <div class="user-email">{{ authStore.user?.email }}</div>
            <a href="#" @click.prevent="logout" class="user-logout">Logout</a>
          </div>
        </div>
        <div v-else class="user-profile-unauthenticated">
          <button @click="login" class="login-button">Login / Sign up</button>
        </div>
      </div>
    </div>
    
    <!-- Main Content Area -->
    <main :class="{ 'main-content': !isAuthPage, 'auth-content': isAuthPage }">
      <router-view />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5fb;
}

.app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 230px;
  background-color: white;
  padding: 25px 25px 15px 25px; /* Reduced bottom padding */
  margin: 15px;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* This helps push the user profile to the bottom */
}

.logo {
  background-color: #f5f0ff;
  color: #7e3af2;
  padding: 15px;
  border-radius: 10px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1; /* Allows the menu to grow and push profile down */
}

.nav-item {
  padding: 12px 15px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.nav-item a {
  color: #333;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-size: 15px;
}

.nav-item.active {
  background-color: #f0e6ff;
}

.nav-item.active a {
  color: #7e3af2;
  font-weight: bold;
}

.nav-item:hover:not(.active) {
  background-color: #f8f9fa;
}

/* User Profile Section */
.user-profile {
  display: flex;
  align-items: center;
  padding: 8px 5px;
  margin-top: 10px; 
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0; /* Prevents the profile from shrinking */
}

.user-profile-authenticated {
  display: flex;
  align-items: center;
  width: 100%;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.default-avatar {
  background-color: #7e3af2;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-icon {
  font-size: 18px;
  line-height: 1;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 12px;
  color: #333;
  line-height: 1.1;
}

.user-email {
  font-size: 10px;
  color: #666;
  margin-top: 2px;
}

.user-logout {
  font-size: 10px;
  color: #7e3af2;
  text-decoration: none;
  margin-top: 3px;
}

.user-logout:hover {
  text-decoration: underline;
}

.user-profile-unauthenticated {
  width: 100%;
}

.login-button {
  width: 100%;
  padding: 8px 12px;
  background-color: #7e3af2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #6929d4;
}

.main-content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  margin: 15px 15px 15px 0;
}

.auth-content {
  flex: 1;
  padding: 0;
  margin: 0;
}
</style>
