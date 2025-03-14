import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'
import { ref, computed } from 'vue'

// Define API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useProductStore = defineStore('products', () => {
  // State
  const products = ref([])
  const selectedProduct = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const isCreating = ref(false)

  // MOCK DATA FOR DEVELOPMENT - Remove when backend is ready
  const mockCustomerProducts = {}; // customerId -> array of products

  // Getters
  const getProductById = computed(() => {
    return (id) => products.value.find(product => product.id === id)
  })

  // Actions
  // Fetch all products
  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get(`${API_URL}/products`)
      products.value = response.data
    } catch (err) {
      console.error('Failed to fetch products:', err)
      error.value = err.message || 'Failed to fetch products'
    } finally {
      loading.value = false
    }
  }

  // Fetch a single product
  const fetchProduct = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get(`${API_URL}/products/${id}`)
      selectedProduct.value = response.data
      return response.data
    } catch (err) {
      console.error('Failed to fetch product:', err)
      error.value = err.message || 'Failed to fetch product'
      return null
    } finally {
      loading.value = false
    }
  }

  // Create a new product
  const createProduct = async (productData) => {
    loading.value = true
    isCreating.value = true
    error.value = null
    
    // Get auth token
    const authStore = useAuthStore()
    
    console.log('Creating product with data:', productData);
    console.log('Using token:', authStore.token ? 'Token exists' : 'No token');
    
    try {
      const response = await axios.post(`${API_URL}/products`, {
        name: productData.name,
        description: productData.description
      }, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      console.log('Server response:', response.data);
      products.value.unshift(response.data) // Add to the beginning of the array
      return response.data
    } catch (err) {
      console.error('Detailed API Error:', err);
      if (err.response) {
        console.log('Error status:', err.response.status);
        console.log('Error data:', err.response.data);
        error.value = err.response.data.error || 'Failed to create product';
      } else if (err.request) {
        console.log('No response received:', err.request);
        error.value = 'No response from server';
      } else {
        console.log('Error message:', err.message);
        error.value = err.message;
      }
      return null
    } finally {
      loading.value = false
      isCreating.value = false
    }
  }

  // Update a product
  const updateProduct = async (id, productData) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      
      const response = await axios.put(`${API_URL}/products/${id}`, productData, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      
      // Update the product in the local array
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      
      return response.data
    } catch (err) {
      console.error('Failed to update product:', err)
      error.value = err.message || 'Failed to update product'
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete a product
  const deleteProduct = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      
      // Remove the product from the array
      products.value = products.value.filter(p => p.id !== id)
      
      // Clear the selected product if it's the same product
      if (selectedProduct.value && selectedProduct.value.id === id) {
        selectedProduct.value = null
      }
      
      return true
    } catch (err) {
      error.value = err.message || 'Failed to delete product'
      console.error('API Error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Clear selected product
  const clearSelectedProduct = () => {
    selectedProduct.value = null
  }

  // Mock implementation - Fetch products associated with a customer
  const mockFetchCustomerProducts = async (customerId) => {
    console.log('MOCK: Fetching products for customer', customerId);
    
    // Initialize if not exists
    if (!mockCustomerProducts[customerId]) {
      mockCustomerProducts[customerId] = [];
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCustomerProducts[customerId];
  };

  // Mock implementation - Associate products with a customer
  const mockAssociateProducts = async (customerId, productIds) => {
    console.log('MOCK: Associating products with customer', customerId, productIds);
    
    // Initialize if not exists
    if (!mockCustomerProducts[customerId]) {
      mockCustomerProducts[customerId] = [];
    }
    
    // Find products by ID
    const productsToAdd = products.value.filter(p => productIds.includes(p.id));
    
    // Add products (avoid duplicates)
    productsToAdd.forEach(product => {
      if (!mockCustomerProducts[customerId].some(p => p.id === product.id)) {
        mockCustomerProducts[customerId].push(product);
      }
    });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCustomerProducts[customerId];
  };

  // Mock implementation - Disassociate products from a customer
  const mockDisassociateProducts = async (customerId, productIds) => {
    console.log('MOCK: Disassociating products from customer', customerId, productIds);
    
    // Initialize if not exists
    if (!mockCustomerProducts[customerId]) {
      mockCustomerProducts[customerId] = [];
    }
    
    // Remove products
    mockCustomerProducts[customerId] = mockCustomerProducts[customerId]
      .filter(product => !productIds.includes(product.id));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCustomerProducts[customerId];
  };

  // Toggle between real and mock implementations
  const USE_MOCK_DATA = true; // Temporarily using mock data until backend API is ready

  // Fetch products associated with a customer
  const fetchCustomerProducts = async (customerId) => {
    if (USE_MOCK_DATA) {
      return mockFetchCustomerProducts(customerId);
    }
    
    loading.value = true;
    error.value = null;
    
    console.log(`Fetching products for customer ${customerId}`);
    
    try {
      const url = `${API_URL}/customers/${customerId}/products`;
      console.log('Making API request to:', url);
      
      const response = await axios.get(url);
      console.log('Fetched customer products:', response.data);
      return response.data;
    } catch (err) {
      if (err.response) {
        console.error('API Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        error.value = err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        console.error('No response received:', err.request);
        error.value = 'No response from server. Check network connection.';
      } else {
        console.error('Error message:', err.message);
        error.value = err.message;
      }
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Associate products with a customer
  const associateProductsWithCustomer = async (customerId, productIds) => {
    if (USE_MOCK_DATA) {
      return mockAssociateProducts(customerId, productIds);
    }
    
    loading.value = true;
    error.value = null;
    
    console.log(`Associating products with customer ${customerId}:`, productIds);
    
    try {
      // Get auth token
      const authStore = useAuthStore();
      console.log('Using token:', authStore.token ? 'Token exists' : 'No token');
      
      const url = `${API_URL}/customers/${customerId}/products`;
      console.log('Making API request to:', url);
      
      const response = await axios.post(url, {
        productIds
      }, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });
      console.log('Server response:', response.data);
      return response.data;
    } catch (err) {
      if (err.response) {
        console.error('API Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        error.value = err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        console.error('No response received:', err.request);
        error.value = 'No response from server. Check network connection.';
      } else {
        console.error('Error message:', err.message);
        error.value = err.message;
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Disassociate products from a customer
  const disassociateProductsFromCustomer = async (customerId, productIds) => {
    if (USE_MOCK_DATA) {
      return mockDisassociateProducts(customerId, productIds);
    }
    
    loading.value = true;
    error.value = null;
    
    console.log(`Disassociating products from customer ${customerId}:`, productIds);
    
    try {
      // Get auth token
      const authStore = useAuthStore();
      console.log('Using token:', authStore.token ? 'Token exists' : 'No token');
      
      const url = `${API_URL}/customers/${customerId}/products/remove`;
      console.log('Making API request to:', url);
      
      const response = await axios.post(url, {
        productIds
      }, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });
      console.log('Server response:', response.data);
      return response.data;
    } catch (err) {
      if (err.response) {
        console.error('API Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        error.value = err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        console.error('No response received:', err.request);
        error.value = 'No response from server. Check network connection.';
      } else {
        console.error('Error message:', err.message);
        error.value = err.message;
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    products,
    selectedProduct,
    loading,
    error,
    isCreating,
    
    // Getters
    getProductById,
    
    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    clearSelectedProduct,
    fetchCustomerProducts,
    associateProductsWithCustomer,
    disassociateProductsFromCustomer
  }
}) 