import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    currentUser: (state) => state.user,
  },
  
  actions: {
    setToken(token) {
      this.token = token;
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    },
    
    async fetchUser() {
      try {
        this.loading = true;
        this.error = null;
        
        if (!this.token) {
          this.user = null;
          return;
        }
        
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        
        this.user = response.data;
      } catch (error) {
        console.error('Error fetching user:', error);
        this.error = error.response?.data?.message || 'Failed to fetch user';
        this.user = null;
        this.setToken(null);
      } finally {
        this.loading = false;
      }
    },
    
    async handleAuthCallback(token) {
      this.setToken(token);
      await this.fetchUser();
      return this.user;
    },
    
    logout() {
      this.user = null;
      this.setToken(null);
    }
  }
}); 