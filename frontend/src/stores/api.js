import { defineStore } from 'pinia'
import axios from 'axios'

// Define API base URL - adjust port if needed
const API_URL = 'http://localhost:3000/api'

export const useApiStore = defineStore('api', {
  state: () => ({
    greeting: '',
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchGreeting() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_URL}/hello`)
        this.greeting = response.data.message
      } catch (err) {
        this.error = err.message || 'Failed to fetch greeting'
        console.error('API Error:', err)
      } finally {
        this.loading = false
      }
    }
  }
})