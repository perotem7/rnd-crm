<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">{{ isSignup ? 'Create an Account' : 'Welcome Back' }}</h1>
      <p class="login-subtitle">{{ isSignup ? 'Sign up to get started' : 'Log in to your account' }}</p>
      
      <div class="oauth-buttons">
        <button @click="loginWithGoogle" class="google-btn">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Logo" class="google-icon">
          {{ isSignup ? 'Sign up with Google' : 'Log in with Google' }}
        </button>
      </div>
      
      <div class="login-footer">
        <p>
          {{ isSignup ? 'Already have an account?' : "Don't have an account?" }}
          <a href="#" @click.prevent="toggleMode">{{ isSignup ? 'Log in' : 'Sign up' }}</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isSignup = ref(route.name === 'Signup');
const loading = ref(false);
const error = ref(null);

const toggleMode = () => {
  isSignup.value = !isSignup.value;
  router.replace({ name: isSignup.value ? 'Signup' : 'Login' });
};

const loginWithGoogle = () => {
  // Redirect to the backend Google OAuth route
  window.location.href = 'http://localhost:3000/api/auth/google';
};

onMounted(async () => {
  // If user is already authenticated, redirect to home
  if (authStore.isAuthenticated) {
    router.push({ name: 'Home' });
  }
  
  // Check for error in URL
  if (route.query.error) {
    error.value = 'Authentication failed. Please try again.';
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
}

.login-subtitle {
  color: #6c757d;
  margin-bottom: 1.5rem;
  text-align: center;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.google-btn:hover {
  background-color: #f1f3f4;
}

.google-icon {
  width: 18px;
  height: 18px;
}

.login-footer {
  text-align: center;
  font-size: 0.9rem;
}

.login-footer a {
  color: #4285f4;
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
</style> 