import { defineStore } from 'pinia'
import axios from 'axios'

// Define API base URL - adjust port if needed
const API_URL = 'http://localhost:3000/api'

export const useCustomerStore = defineStore('customers', {
  state: () => ({
    customers: [],
    selectedCustomer: null,
    loading: false,
    error: null,
    isCreating: false
  }),
  
  getters: {
    getCustomerById: (state) => (id) => {
      return state.customers.find(customer => customer.id === id)
    }
  },
  
  actions: {
    // Fetch all customers
    async fetchCustomers() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_URL}/customers`)
        this.customers = response.data
      } catch (err) {
        this.error = err.message || 'Failed to fetch customers'
        console.error('API Error:', err)
      } finally {
        this.loading = false
      }
    },
    
    // Fetch a single customer
    async fetchCustomer(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_URL}/customers/${id}`)
        this.selectedCustomer = response.data
        return response.data
      } catch (err) {
        this.error = err.message || 'Failed to fetch customer'
        console.error('API Error:', err)
        return null
      } finally {
        this.loading = false
      }
    },
    
    // Create a new customer
    async createCustomer(customerData) {
      this.loading = true
      this.isCreating = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_URL}/customers`, customerData)
        this.customers.unshift(response.data) // Add to the beginning of the array
        return response.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Failed to create customer'
        console.error('API Error:', err)
        return null
      } finally {
        this.loading = false
        this.isCreating = false
      }
    },
    
    // Update an existing customer
    async updateCustomer(id, customerData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.put(`${API_URL}/customers/${id}`, customerData)
        
        // Update the customer in the customers array
        const index = this.customers.findIndex(c => c.id === id)
        if (index !== -1) {
          this.customers[index] = response.data
        }
        
        // Update selectedCustomer if it's the same customer
        if (this.selectedCustomer && this.selectedCustomer.id === id) {
          this.selectedCustomer = response.data
        }
        
        return response.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Failed to update customer'
        console.error('API Error:', err)
        return null
      } finally {
        this.loading = false
      }
    },
    
    // Delete a customer
    async deleteCustomer(id) {
      this.loading = true
      this.error = null
      
      try {
        await axios.delete(`${API_URL}/customers/${id}`)
        
        // Remove the customer from the array
        this.customers = this.customers.filter(c => c.id !== id)
        
        // Clear selectedCustomer if it's the same customer
        if (this.selectedCustomer && this.selectedCustomer.id === id) {
          this.selectedCustomer = null
        }
        
        return true
      } catch (err) {
        this.error = err.message || 'Failed to delete customer'
        console.error('API Error:', err)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // Clear selected customer
    clearSelectedCustomer() {
      this.selectedCustomer = null
    }
  }
}) 