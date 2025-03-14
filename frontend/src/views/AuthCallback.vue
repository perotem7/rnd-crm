<template>
  <div class="auth-callback">
    <div v-if="loading" class="loading">
      <p>Authenticating...</p>
    </div>
    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="goToLogin" class="retry-btn">Try Again</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref(null);

const goToLogin = () => {
  router.push({ name: 'Login' });
};

onMounted(async () => {
  try {
    loading.value = true;
    
    // Get token from URL
    const token = route.query.token;
    
    if (!token) {
      throw new Error('No token found in the callback URL');
    }
    
    // Process the authentication
    await authStore.handleAuthCallback(token);
    
    // Redirect to home page after successful authentication
    router.push({ name: 'Home' });
  } catch (err) {
    console.error('Auth callback error:', err);
    error.value = err.message || 'Authentication failed. Please try again.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.auth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #3367d6;
}
</style> 