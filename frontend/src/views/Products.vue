<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useProductStore } from '../stores/products';
import { useAuthStore } from '../stores/auth';
import AddProductDialog from '../components/products/AddProductDialog.vue';

const productStore = useProductStore();
const authStore = useAuthStore();
const { 
  products, 
  loading, 
  error,
  isCreating
} = productStore;

// Check if user is authenticated
const isAuthenticated = computed(() => authStore.isAuthenticated);
const checkAuth = () => {
  console.log('Authentication status:', isAuthenticated.value);
  console.log('User:', authStore.currentUser);
  console.log('Token exists:', !!authStore.token);
};

// Modals state
const showCreateDialog = ref(false);
const showViewDialog = ref(false);
const showEditDialog = ref(false);

// Product data
const selectedProduct = ref(null);
const editingProduct = ref(null);
const formError = ref('');

// Track expanded product cards
const expandedCards = ref({});

// Track action menu visibility 
const actionMenuVisible = ref({});

// Toggle card expansion
const toggleCardExpansion = (productId) => {
  expandedCards.value[productId] = !expandedCards.value[productId];
};

// Toggle action menu
const toggleActionMenu = (event, productId) => {
  event.stopPropagation();
  
  // Get the current state
  const isCurrentlyVisible = actionMenuVisible.value[productId];
  
  // Close all other menus first
  closeAllActionMenus();
  
  // Toggle this menu (only set to true if it was false before)
  actionMenuVisible.value[productId] = !isCurrentlyVisible;
  
  // If we're opening a menu, add a one-time event listener to close it when clicking elsewhere
  if (actionMenuVisible.value[productId]) {
    setTimeout(() => {
      document.addEventListener('click', () => {
        actionMenuVisible.value[productId] = false;
      }, { once: true });
    }, 0);
  }
};

// Close all action menus
const closeAllActionMenus = () => {
  Object.keys(actionMenuVisible.value).forEach(id => {
    actionMenuVisible.value[id] = false;
  });
};

// Format price helper
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Handle click outside for action menus
const handleClickOutside = (event) => {
  // If click is on or inside action button, don't do anything
  if (event.target.closest('.action-button')) {
    return;
  }
  
  // If click is on an action-menu-item, don't close menus
  if (event.target.closest('.action-menu-item')) {
    return;
  }
  
  // Otherwise, close all menus
  closeAllActionMenus();
};

// Add and remove global click handler
onMounted(() => {
  checkAuth();
  document.addEventListener('click', handleClickOutside);
  productStore.fetchProducts();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Toggle create dialog
const toggleCreateDialog = () => {
  showCreateDialog.value = !showCreateDialog.value;
};

// Handle product added event
const handleProductAdded = (product) => {
  console.log('Product added:', product);
  // The product is already added to the store by the component
};

// Open view dialog for a product
const viewProduct = (product) => {
  selectedProduct.value = product;
  showViewDialog.value = true;
};

// Close view dialog
const closeViewDialog = () => {
  showViewDialog.value = false;
  selectedProduct.value = null;
};

// Open edit dialog for a product
const editProduct = (product) => {
  // Create a deep copy to avoid mutating the original
  editingProduct.value = JSON.parse(JSON.stringify(product));
  showEditDialog.value = true;
  formError.value = '';
};

// Close edit dialog
const closeEditDialog = () => {
  showEditDialog.value = false;
  editingProduct.value = null;
  formError.value = '';
};

// Submit edited product
const submitEditedProduct = async () => {
  // Basic validation
  if (!editingProduct.value.name) {
    formError.value = 'Name is required';
    return;
  }

  try {
    const updated = await productStore.updateProduct(editingProduct.value.id, editingProduct.value);
    if (updated) {
      closeEditDialog();
    }
  } catch (err) {
    console.error('Error updating product:', err);
  }
};

// Delete product
const deleteProduct = async (id) => {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      await productStore.deleteProduct(id);
      if (showViewDialog.value && selectedProduct.value?.id === id) {
        closeViewDialog();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  }
};
</script>

<template>
  <div class="products-container">
    <div class="products-header">
      <h1>Products</h1>
      <button @click="toggleCreateDialog" class="btn primary">Add Product</button>
    </div>
    
    <div v-if="loading && !products.length" class="loading-message">
      Loading products...
    </div>
    
    <div v-else-if="error && !products.length" class="error-message">
      {{ error }}
    </div>
    
    <div v-else-if="!products.length" class="empty-message">
      No products found. Click "Add Product" to create one.
    </div>
    
    <div v-else class="products-content">
      <div class="sort-bar">
        <span>Sort: </span>
        <select class="sort-select">
          <option value="a-z">A - Z</option>
          <option value="z-a">Z - A</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
      
      <div class="showing-info">
        Showing {{ products.length }} out of {{ products.length }}
      </div>
    
      <div class="product-cards">
        <div v-for="product in products" :key="product.id" class="product-card">
          <div class="card-header">
            <div class="expand-icon" @click="toggleCardExpansion(product.id)">
              <span>{{ expandedCards[product.id] ? '▼' : '►' }}</span>
            </div>
            <div class="product-name" @click="toggleCardExpansion(product.id)">{{ product.name }}</div>
            <div class="card-actions">
              <button class="action-button" @click.stop="toggleActionMenu($event, product.id)">
                <span>⋮</span>
              </button>
              <div v-show="actionMenuVisible[product.id]" class="action-menu">
                <div class="action-menu-item" @click.stop="viewProduct(product)">View Details</div>
                <div class="action-menu-item" @click.stop="editProduct(product)">Edit</div>
                <div class="action-menu-item danger" @click.stop="deleteProduct(product.id)">Delete</div>
              </div>
            </div>
          </div>
          
          <div v-if="expandedCards[product.id]" class="card-details">
            <div class="detail-grid">
              <div class="detail-column">
                <div class="detail-item">
                  <div class="detail-label">Name</div>
                  <div class="detail-value">{{ product.name }}</div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-label">Created</div>
                  <div class="detail-value">{{ formatDate(product.createdAt) }}</div>
                </div>
              </div>
              
              <div class="detail-column">
                <div class="detail-item full-width">
                  <div class="detail-label">Description</div>
                  <div class="detail-value">{{ product.description || 'No description available' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Product Dialog Component -->
    <AddProductDialog 
      :show="showCreateDialog" 
      @close="toggleCreateDialog"
      @product-added="handleProductAdded"
    />
    
    <!-- View Product Dialog -->
    <div v-if="showViewDialog" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Product Details</h2>
          <button @click="closeViewDialog" class="close-btn">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedProduct">
          <div class="detail-row">
            <div class="detail-label">Name:</div>
            <div class="detail-value">{{ selectedProduct.name }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Description:</div>
            <div class="detail-value description">{{ selectedProduct.description || '-' }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Created:</div>
            <div class="detail-value">{{ formatDate(selectedProduct.createdAt) }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeViewDialog" class="btn secondary">Close</button>
          <button @click="editProduct(selectedProduct)" class="btn primary">Edit</button>
        </div>
      </div>
    </div>
    
    <!-- Edit Product Dialog -->
    <div v-if="showEditDialog" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Product</h2>
          <button @click="closeEditDialog" class="close-btn">&times;</button>
        </div>
        <div class="modal-body" v-if="editingProduct">
          <div v-if="formError" class="form-error">{{ formError }}</div>
          
          <div class="form-group">
            <label for="edit-name">Product Name *</label>
            <input type="text" id="edit-name" v-model="editingProduct.name" placeholder="Product name">
          </div>
          
          <div class="form-group">
            <label for="edit-description">Description</label>
            <textarea id="edit-description" v-model="editingProduct.description" placeholder="Product description"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeEditDialog" class="btn secondary">Cancel</button>
          <button @click="submitEditedProduct" class="btn primary" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 0;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-top: 20px;
}

.products-header h1 {
  margin: 0;
  font-size: 24px;
}

.sort-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
}

.sort-select {
  padding: 5px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-left: 5px;
  background-color: #f8f9fa;
}

.showing-info {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 15px;
  text-align: right;
}

.loading-message, .error-message, .empty-message {
  padding: 20px;
  text-align: center;
  color: #6c757d;
}

.error-message {
  color: #dc3545;
}

/* Product Card Styles */
.product-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  background-color: #ffffff;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.expand-icon {
  margin-right: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
}

.expand-icon:hover {
  background-color: #e9ecef;
}

.product-name {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.product-name:hover {
  color: #7e3af2;
}

.card-actions {
  display: flex;
  position: absolute;
  z-index: 200;
  right: 46px;
}

.action-button {
  background: none;
  border: none;
  font-size: 18px;
  padding: 5px;
  cursor: pointer;
  color: #6c757d;
}

.action-button:hover {
  color: #343a40;
}

.action-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.15);
  z-index: 500;
  min-width: 160px;
  overflow: visible;
  animation: fadeInMenu 0.15s ease-out;
}

@keyframes fadeInMenu {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-menu-item {
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.action-menu-item:hover {
  background-color: #f8f9fa;
}

.action-menu-item.danger {
  color: #dc3545;
}

.action-menu-item.danger:hover {
  background-color: #ffebee;
}

.card-details {
  padding: 15px;
  border-top: 1px solid #f0f0f0;
  background-color: #ffffff;
  animation: expandCard 0.2s ease-out;
  transform-origin: top;
}

@keyframes expandCard {
  from {
    opacity: 0.7;
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

.detail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.detail-column {
  flex: 1;
  min-width: 200px;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-item.full-width {
  width: 100%;
}

.detail-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 5px;
}

.detail-value {
  font-size: 14px;
  word-break: break-word;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
}

.detail-row .detail-label {
  width: 150px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.detail-row .detail-value {
  flex: 1;
  font-size: 14px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn.primary {
  background-color: #7e3af2;
  color: white;
}

.btn.primary:hover {
  background-color: #6929d4;
}

.btn.secondary {
  background-color: #e9ecef;
  color: #495057;
}

.btn.secondary:hover {
  background-color: #dee2e6;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #adb5bd;
}

.close-btn:hover {
  color: #495057;
}

.modal-body {
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-group {
  margin-bottom: 15px;
  width: 100%;
  box-sizing: border-box;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.form-error {
  color: #dc3545;
  margin-bottom: 15px;
  font-size: 14px;
}

.description {
  white-space: pre-line;
}
</style> 