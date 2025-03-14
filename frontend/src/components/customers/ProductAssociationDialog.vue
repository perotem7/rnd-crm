<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProductStore } from '../../stores/products';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  customer: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'products-updated']);

const productStore = useProductStore();

// Local state
const associatedProducts = ref([]);
const unassociatedProducts = ref([]);
const loading = ref(false);
const error = ref(null);

// Selected products for transferring
const selectedAssociated = ref([]);
const selectedUnassociated = ref([]);

// Watch for dialog visibility changes
watch(() => props.show, async (newValue) => {
  if (newValue && props.customer) {
    // Reset selections
    selectedAssociated.value = [];
    selectedUnassociated.value = [];
    
    // Load data when dialog opens
    await loadProducts();
  }
});

// Load all products and separate them
const loadProducts = async () => {
  if (!props.customer) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    console.log(`Loading products for customer ${props.customer.id}`);
    
    // Fetch all products
    await productStore.fetchProducts();
    console.log('All products loaded:', productStore.products.length);
    
    // Fetch customer's associated products
    try {
      const customerProducts = await productStore.fetchCustomerProducts(props.customer.id);
      console.log('Customer products loaded:', customerProducts.length);
      
      // Set associated products
      associatedProducts.value = customerProducts;
      
      // Filter out the associated products from all products
      unassociatedProducts.value = productStore.products
        .filter(product => !customerProducts.some(cp => cp.id === product.id));
      
      console.log('Products separated:', {
        associated: associatedProducts.value.length,
        unassociated: unassociatedProducts.value.length
      });
    } catch (customerProductsError) {
      console.error('Customer products loading failed:', customerProductsError);
      throw customerProductsError;
    }
  } catch (err) {
    console.error('Failed to load products:', err);
    if (err.response) {
      console.error('Error response:', err.response.status, err.response.data);
      error.value = `Failed to load products: ${err.response.status} - ${JSON.stringify(err.response.data)}`;
    } else if (err.request) {
      console.error('No response received:', err.request);
      error.value = 'Failed to load products: No response from server';
    } else {
      console.error('Error details:', err.message);
      error.value = `Failed to load products: ${err.message}`;
    }
  } finally {
    loading.value = false;
  }
};

// Handle product selection in the associated products list
const toggleAssociatedSelection = (product) => {
  const index = selectedAssociated.value.findIndex(p => p.id === product.id);
  if (index === -1) {
    selectedAssociated.value.push(product);
  } else {
    selectedAssociated.value.splice(index, 1);
  }
};

// Handle product selection in the unassociated products list
const toggleUnassociatedSelection = (product) => {
  const index = selectedUnassociated.value.findIndex(p => p.id === product.id);
  if (index === -1) {
    selectedUnassociated.value.push(product);
  } else {
    selectedUnassociated.value.splice(index, 1);
  }
};

// Move selected products from unassociated to associated
const moveToAssociated = async () => {
  if (!selectedUnassociated.value.length) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // Call API to associate products with the customer
    await productStore.associateProductsWithCustomer(
      props.customer.id, 
      selectedUnassociated.value.map(p => p.id)
    );
    
    // Update local state - prevent duplicates by only adding products that don't already exist
    const newAssociatedProducts = selectedUnassociated.value.filter(
      product => !associatedProducts.value.some(p => p.id === product.id)
    );
    associatedProducts.value = [...associatedProducts.value, ...newAssociatedProducts];
    
    unassociatedProducts.value = unassociatedProducts.value
      .filter(p => !selectedUnassociated.value.some(sp => sp.id === p.id));
    
    // Clear selections
    selectedUnassociated.value = [];
    
    // Emit event to notify parent component
    emit('products-updated', associatedProducts.value);
    
  } catch (err) {
    console.error('Failed to associate products:', err);
    if (err.response) {
      console.error('Error response:', err.response.status, err.response.data);
      error.value = `Failed to associate products: ${err.response.status} - ${JSON.stringify(err.response.data)}`;
    } else if (err.request) {
      console.error('No response received:', err.request);
      error.value = 'Failed to associate products: No response from server';
    } else {
      console.error('Error details:', err.message);
      error.value = `Failed to associate products: ${err.message}`;
    }
  } finally {
    loading.value = false;
  }
};

// Move selected products from associated to unassociated
const moveToUnassociated = async () => {
  if (!selectedAssociated.value.length) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // Call API to disassociate products from the customer
    await productStore.disassociateProductsFromCustomer(
      props.customer.id, 
      selectedAssociated.value.map(p => p.id)
    );
    
    // Update local state
    unassociatedProducts.value = [...unassociatedProducts.value, ...selectedAssociated.value];
    associatedProducts.value = associatedProducts.value
      .filter(p => !selectedAssociated.value.some(sp => sp.id === p.id));
    
    // Clear selections
    selectedAssociated.value = [];
    
    // Emit event to notify parent component
    emit('products-updated', associatedProducts.value);
    
  } catch (err) {
    console.error('Failed to disassociate products:', err);
    error.value = 'Failed to disassociate products. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Close dialog
const closeDialog = () => {
  emit('close');
};
</script>

<template>
  <div v-if="show" class="dialog-overlay" @click="closeDialog">
    <div class="dialog-content product-association-dialog" @click.stop>
      <div class="dialog-header">
        <h2>Manage Products for {{ customer ? customer.name : 'Customer' }}</h2>
        <button class="close-button" @click="closeDialog">&times;</button>
      </div>
      
      <div class="dialog-body">
        <!-- Error message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <!-- Loading message -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <div>Loading products...</div>
        </div>
        
        <div class="product-association-container">
          <!-- Unassociated products -->
          <div class="product-panel">
            <h3>Available Products</h3>
            <div class="product-search">
              <input type="text" placeholder="Search available products..." />
            </div>
            
            <div class="product-list">
              <div v-if="unassociatedProducts.length === 0" class="empty-message">
                No products available.
              </div>
              
              <div 
                v-for="product in unassociatedProducts" 
                :key="product.id"
                class="product-item"
                :class="{ selected: selectedUnassociated.some(p => p.id === product.id) }"
                @click="toggleUnassociatedSelection(product)"
              >
                <div class="product-name">{{ product.name }}</div>
                <div class="product-sku">{{ product.sku || 'No SKU' }}</div>
              </div>
            </div>
          </div>
          
          <!-- Transfer controls -->
          <div class="transfer-controls">
            <button 
              class="transfer-button"
              :disabled="selectedUnassociated.length === 0"
              @click="moveToAssociated"
              title="Associate selected products"
            >
              →
            </button>
            
            <button 
              class="transfer-button"
              :disabled="selectedAssociated.length === 0"
              @click="moveToUnassociated"
              title="Remove associated products"
            >
              ←
            </button>
          </div>
          
          <!-- Associated products -->
          <div class="product-panel">
            <h3>Associated Products</h3>
            <div class="product-search">
              <input type="text" placeholder="Search associated products..." />
            </div>
            
            <div class="product-list">
              <div v-if="associatedProducts.length === 0" class="empty-message">
                No products associated with this customer.
              </div>
              
              <div 
                v-for="product in associatedProducts" 
                :key="product.id"
                class="product-item"
                :class="{ selected: selectedAssociated.some(p => p.id === product.id) }"
                @click="toggleAssociatedSelection(product)"
              >
                <div class="product-name">{{ product.name }}</div>
                <div class="product-sku">{{ product.sku || 'No SKU' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button class="btn secondary" @click="closeDialog">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.dialog-body {
  padding: 20px;
  position: relative;
}

.dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.close-button:hover {
  color: #343a40;
}

.error-message {
  background-color: #ffd2d2;
  color: #d8000c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4361ee;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.product-association-container {
  display: flex;
  gap: 20px;
  height: 500px;
}

.product-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.product-panel h3 {
  margin: 0;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-size: 1.1rem;
}

.product-search {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.product-search input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.product-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.product-item {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.product-item:hover {
  background-color: #f5f5f5;
}

.product-item.selected {
  background-color: #e6f0ff;
  border-color: #4361ee;
}

.product-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.product-sku {
  font-size: 12px;
  color: #6c757d;
}

.transfer-controls {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.transfer-button {
  width: 40px;
  height: 40px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.transfer-button:hover:not(:disabled) {
  background-color: #3a56d4;
}

.transfer-button:disabled {
  background-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
}

.empty-message {
  color: #6c757d;
  text-align: center;
  padding: 40px 0;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn.secondary {
  background-color: #e9ecef;
  color: #212529;
}

.btn.secondary:hover {
  background-color: #dde2e6;
}
</style> 