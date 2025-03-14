<script setup>
import { ref } from 'vue';
import { useProductStore } from '../../stores/products';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'product-added']);

const productStore = useProductStore();
const authStore = useAuthStore();
const { isCreating } = productStore;

// Product data
const newProduct = ref({
  name: '',
  description: ''
});
const formError = ref('');

// Reset create form
const resetForm = () => {
  newProduct.value = {
    name: '',
    description: ''
  };
  formError.value = '';
};

// Close dialog
const closeDialog = () => {
  resetForm();
  emit('close');
};

// Submit new product
const submitNewProduct = async () => {
  // Basic validation
  if (!newProduct.value.name) {
    formError.value = 'Name is required';
    return;
  }

  try {
    console.log('Submitting product:', newProduct.value);
    console.log('Auth status before submit:', !!authStore.token);
    console.log('Token before submit:', authStore.token?.substring(0, 10) + '...');
    
    const created = await productStore.createProduct(newProduct.value);
    console.log('Response from createProduct:', created);
    
    if (created) {
      emit('product-added', created);
      closeDialog();
    } else {
      formError.value = productStore.error || 'Failed to create product';
    }
  } catch (err) {
    console.error('Error creating product (detailed):', err);
    formError.value = err.message || 'Error creating product';
  }
};
</script>

<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Add New Product</h2>
        <button @click="closeDialog" class="close-btn">&times;</button>
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
      </div>
      <div class="modal-footer">
        <button @click="closeDialog" class="btn secondary">Cancel</button>
        <button @click="submitNewProduct" class="btn primary" :disabled="isCreating">
          {{ isCreating ? 'Creating...' : 'Create Product' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style> 