import { defineStore } from 'pinia'
import axios from 'axios'

// Define API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
    isCreating: false
  }),
  
  getters: {
    getProductById: (state) => (id) => {
      return state.products.find(product => product.id === id)
    }
  },
  
  actions: {
    // Fetch all products
    async fetchProducts() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_URL}/products`)
        this.products = response.data
      } catch (err) {
        this.error = err.message || 'Failed to fetch products'
        console.error('API Error:', err)
      } finally {
        this.loading = false
      }
    },
    
    // Fetch a single product
    async fetchProduct(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_URL}/products/${id}`)
        this.selectedProduct = response.data
        return response.data
      } catch (err) {
        this.error = err.message || 'Failed to fetch product'
        console.error('API Error:', err)
        return null
      } finally {
        this.loading = false
      }
    },
    
    // Create a new product
    async createProduct(productData) {
      this.loading = true
      this.isCreating = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_URL}/products`, productData)
        this.products.unshift(response.data) // Add to the beginning of the array
        return response.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Failed to create product'
        console.error('API Error:', err)
        return null
      } finally {
        this.loading = false
        this.isCreating = false
      }
    },
    
    // Update an existing product
    async updateProduct(id, productData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.put(`${API_URL}/products/${id}`, productData)
        
        // Update the product in the products array
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = response.data
        }
        
        // Update selectedProduct if it's the same product
        if (this.selectedProduct && this.selectedProduct.id === id) {
          this.selectedProduct = response.data
        }
        
        return response.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Failed to update product'
        console.error('API Error:', err)
        return null
      } finally {
        this.loading = false
      }
    },
    
    // Delete a product
    async deleteProduct(id) {
      this.loading = true
      this.error = null
      
      try {
        await axios.delete(`${API_URL}/products/${id}`)
        
        // Remove the product from the array
        this.products = this.products.filter(p => p.id !== id)
        
        // Clear selectedProduct if it's the same product
        if (this.selectedProduct && this.selectedProduct.id === id) {
          this.selectedProduct = null
        }
        
        return true
      } catch (err) {
        this.error = err.message || 'Failed to delete product'
        console.error('API Error:', err)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // Clear selected product
    clearSelectedProduct() {
      this.selectedProduct = null
    }
  }
}) 