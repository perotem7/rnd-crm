<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '../stores/products';

const productStore = useProductStore();
const { 
  products, 
  loading, 
  error,
  isCreating
} = productStore;

// Modals state
const showCreateDialog = ref(false);
const showViewDialog = ref(false);
const showEditDialog = ref(false);

// Product data
const newProduct = ref({
  name: '',
  description: '',
  price: '',
  sku: '',
  category: '',
  stockLevel: 0
});

const selectedProduct = ref(null);
const editingProduct = ref(null);
const formError = ref('');

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

// Get products on component mount
onMounted(async () => {
  await productStore.fetchProducts();
});

// Reset create form
const resetCreateForm = () => {
  newProduct.value = {
    name: '',
    description: '',
    price: '',
    sku: '',
    category: '',
    stockLevel: 0
  };
  formError.value = '';
};

// Toggle create dialog
const toggleCreateDialog = () => {
  showCreateDialog.value = !showCreateDialog.value;
  if (!showCreateDialog.value) {
    resetCreateForm();
  }
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
  if (!editingProduct.value.name || !editingProduct.value.price || !editingProduct.value.sku) {
    formError.value = 'Name, price, and SKU are required';
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

// Submit new product
const submitNewProduct = async () => {
  // Basic validation
  if (!newProduct.value.name || !newProduct.value.price || !newProduct.value.sku) {
    formError.value = 'Name, price, and SKU are required';
    return;
  }

  try {
    const created = await productStore.createProduct(newProduct.value);
    if (created) {
      toggleCreateDialog();
    }
  } catch (err) {
    console.error('Error creating product:', err);
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
      <button @click="toggleCreateDialog" class="btn-primary">Add Product</button>
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
    
    <table v-else class="products-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>SKU</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.sku }}</td>
          <td>{{ formatPrice(product.price) }}</td>
          <td>{{ product.stockLevel }}</td>
          <td>{{ product.category || '-' }}</td>
          <td class="actions">
            <button @click="viewProduct(product)" class="btn-view">View</button>
            <button @click="editProduct(product)" class="btn-edit">Edit</button>
            <button @click="deleteProduct(product.id)" class="btn-delete">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Create Product Dialog -->
    <div v-if="showCreateDialog" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add New Product</h2>
          <button @click="toggleCreateDialog" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="formError" class="form-error">{{ formError }}</div>
          
          <div class="form-group">
            <label for="name">Product Name *</label>
            <input type="text" id="name" v-model="newProduct.name" placeholder="Product name">
          </div>
          
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" v-model="newProduct.description" placeholder="Product description"></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="price">Price *</label>
              <input type="number" id="price" v-model="newProduct.price" placeholder="0.00" min="0" step="0.01">
            </div>
            
            <div class="form-group">
              <label for="sku">SKU *</label>
              <input type="text" id="sku" v-model="newProduct.sku" placeholder="SKU">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="category">Category</label>
              <input type="text" id="category" v-model="newProduct.category" placeholder="Category">
            </div>
            
            <div class="form-group">
              <label for="stockLevel">Stock Level</label>
              <input type="number" id="stockLevel" v-model="newProduct.stockLevel" placeholder="0" min="0">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="toggleCreateDialog" class="btn-secondary">Cancel</button>
          <button @click="submitNewProduct" class="btn-primary" :disabled="isCreating">
            {{ isCreating ? 'Creating...' : 'Create Product' }}
          </button>
        </div>
      </div>
    </div>
    
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
            <div class="detail-label">SKU:</div>
            <div class="detail-value">{{ selectedProduct.sku }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Price:</div>
            <div class="detail-value">{{ formatPrice(selectedProduct.price) }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Stock Level:</div>
            <div class="detail-value">{{ selectedProduct.stockLevel }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Category:</div>
            <div class="detail-value">{{ selectedProduct.category || '-' }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Description:</div>
            <div class="detail-value description">{{ selectedProduct.description || '-' }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Created:</div>
            <div class="detail-value">{{ formatDate(selectedProduct.createdAt) }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Last Updated:</div>
            <div class="detail-value">{{ formatDate(selectedProduct.updatedAt) }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeViewDialog" class="btn-secondary">Close</button>
          <button @click="editProduct(selectedProduct)" class="btn-primary">Edit</button>
          <button @click="deleteProduct(selectedProduct.id)" class="btn-delete">Delete</button>
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
          
          <div class="form-row">
            <div class="form-group">
              <label for="edit-price">Price *</label>
              <input type="number" id="edit-price" v-model="editingProduct.price" placeholder="0.00" min="0" step="0.01">
            </div>
            
            <div class="form-group">
              <label for="edit-sku">SKU *</label>
              <input type="text" id="edit-sku" v-model="editingProduct.sku" placeholder="SKU">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="edit-category">Category</label>
              <input type="text" id="edit-category" v-model="editingProduct.category" placeholder="Category">
            </div>
            
            <div class="form-group">
              <label for="edit-stockLevel">Stock Level</label>
              <input type="number" id="edit-stockLevel" v-model="editingProduct.stockLevel" placeholder="0" min="0">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeEditDialog" class="btn-secondary">Cancel</button>
          <button @click="submitEditedProduct" class="btn-primary" :disabled="loading">
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
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.products-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.products-table th {
  text-align: left;
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.products-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #dee2e6;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 8px;
}

.loading-message, .error-message, .empty-message {
  padding: 20px;
  text-align: center;
  color: #6c757d;
}

.error-message {
  color: #dc3545;
}

.btn-primary {
  background-color: #7e3af2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background-color: #6929d4;
}

.btn-secondary {
  background-color: #e9ecef;
  color: #495057;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background-color: #dee2e6;
}

.btn-view, .btn-edit, .btn-delete {
  padding: 5px 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
}

.btn-view {
  background-color: #e9ecef;
  color: #495057;
}

.btn-edit {
  background-color: #7e3af2;
  color: white;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-view:hover {
  background-color: #dee2e6;
}

.btn-edit:hover {
  background-color: #6929d4;
}

.btn-delete:hover {
  background-color: #c82333;
}

/* Modal Styles */
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Form Styles */
.form-group {
  margin-bottom: 15px;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

label {
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

/* Detail View Styles */
.detail-row {
  display: flex;
  margin-bottom: 12px;
}

.detail-label {
  width: 150px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.detail-value {
  flex: 1;
  font-size: 14px;
}

.description {
  white-space: pre-line;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 