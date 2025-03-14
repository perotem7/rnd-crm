<script setup>
import { ref, watch } from 'vue';
import { useCustomerStore } from '../../stores/customers';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  customer: {
    type: Object,
    default: null
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'customer-added', 'customer-updated']);

const customerStore = useCustomerStore();
const { isCreating, loading } = customerStore;

// Customer data
const customerData = ref({
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  notes: ''
});

const formError = ref('');
const dialogTitle = ref('');

// Reset form fields
const resetForm = () => {
  customerData.value = {
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: ''
  };
  formError.value = '';
};

// Update dialog title based on mode
watch(() => props.isEditMode, (newVal) => {
  dialogTitle.value = newVal ? 'Edit Customer' : 'Add New Customer';
}, { immediate: true });

// Initialize form data when customer prop changes
watch(() => props.customer, (newVal) => {
  if (newVal && props.isEditMode) {
    // Create a deep copy to avoid mutating the original
    customerData.value = JSON.parse(JSON.stringify(newVal));
  } else {
    // Reset form for new customer
    resetForm();
  }
}, { immediate: true });

// Close dialog
const closeDialog = () => {
  emit('close');
  resetForm();
};

// Submit form
const submitForm = async () => {
  // Basic validation
  if (!customerData.value.name || !customerData.value.email) {
    formError.value = 'Name and email are required';
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerData.value.email)) {
    formError.value = 'Please enter a valid email address';
    return;
  }
  
  try {
    if (props.isEditMode) {
      await customerStore.updateCustomer(customerData.value.id, customerData.value);
      emit('customer-updated', customerData.value);
    } else {
      const newCustomer = await customerStore.createCustomer(customerData.value);
      emit('customer-added', newCustomer);
    }
    closeDialog();
  } catch (err) {
    formError.value = err.message || 'An error occurred';
  }
};

// Delete customer (only in edit mode)
const deleteCustomer = async () => {
  if (confirm('Are you sure you want to delete this customer?')) {
    try {
      await customerStore.deleteCustomer(customerData.value.id);
      closeDialog();
    } catch (err) {
      formError.value = err.message || 'Failed to delete customer';
    }
  }
};
</script>

<template>
  <div v-if="show" class="dialog-overlay" @click="closeDialog">
    <div class="dialog-content" @click.stop>
      <div class="dialog-header">
        <h2>{{ dialogTitle }}</h2>
        <button class="close-button" @click="closeDialog">&times;</button>
      </div>
      
      <div class="dialog-body">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="name">Name *</label>
            <input 
              id="name" 
              v-model="customerData.name" 
              type="text" 
              placeholder="Full Name"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="email">Email *</label>
            <input 
              id="email" 
              v-model="customerData.email" 
              type="email" 
              placeholder="email@example.com"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="phone">Phone</label>
            <input 
              id="phone" 
              v-model="customerData.phone" 
              type="tel" 
              placeholder="Phone Number"
            />
          </div>
          
          <div class="form-group">
            <label for="company">Company</label>
            <input 
              id="company" 
              v-model="customerData.company" 
              type="text" 
              placeholder="Company Name"
            />
          </div>
          
          <div class="form-group">
            <label for="address">Address</label>
            <textarea 
              id="address" 
              v-model="customerData.address" 
              rows="2" 
              placeholder="Street Address"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea 
              id="notes" 
              v-model="customerData.notes" 
              rows="3" 
              placeholder="Additional information..."
            ></textarea>
          </div>
          
          <div v-if="formError" class="error-message">{{ formError }}</div>
          
          <div class="dialog-actions">
            <button 
              v-if="isEditMode" 
              type="button" 
              class="btn danger" 
              @click="deleteCustomer"
              :disabled="loading"
            >
              Delete Customer
            </button>
            
            <div class="action-buttons">
              <button 
                type="button" 
                class="btn secondary" 
                @click="closeDialog"
                :disabled="isCreating || loading"
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                class="btn primary" 
                :disabled="isCreating || loading"
              >
                {{ isEditMode ? 'Update' : 'Add' }} Customer
              </button>
            </div>
          </div>
        </form>
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.error-message {
  color: #e53935;
  margin: 1rem 0;
}

.dialog-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 