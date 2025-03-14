<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Computed property to get the current route path
const currentPath = computed(() => route.path);
</script>

<template>
  <div class="app">
    <!-- Sidebar -->
    <div class="sidebar">
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
        <div class="user-avatar">
          <img src="https://ui-avatars.com/api/?name=User&background=7e3af2&color=fff" alt="User Avatar" />
        </div>
        <div class="user-info">
          <div class="user-name">User Name</div>
          <router-link to="/settings" class="user-settings">View Profile</router-link>
        </div>
      </div>
    </div>
    
    <!-- Main Content Area -->
    <main class="main-content">
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

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 8px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.user-settings {
  font-size: 10px;
  color: #7e3af2;
  text-decoration: none;
  margin-top: 1px;
}

.user-settings:hover {
  text-decoration: underline;
}

.main-content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  margin: 15px 15px 15px 0;
}
</style>
