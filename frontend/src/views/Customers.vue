<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCustomerStore } from '../stores/customers';

const customerStore = useCustomerStore();
const { 
  customers, 
  loading, 
  error,
  isCreating
} = customerStore;

// Modals state
const showCreateDialog = ref(false);
const showViewDialog = ref(false);
const showEditDialog = ref(false);

// Customer data
const newCustomer = ref({
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  notes: ''
});

const selectedCustomer = ref(null);
const editingCustomer = ref(null);
const formError = ref('');

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Get customers on component mount
onMounted(async () => {
  await customerStore.fetchCustomers();
});

// Reset create form
const resetCreateForm = () => {
  newCustomer.value = {
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: ''
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

// Open view dialog for a customer
const viewCustomer = (customer) => {
  selectedCustomer.value = customer;
  showViewDialog.value = true;
};

// Close view dialog
const closeViewDialog = () => {
  showViewDialog.value = false;
  selectedCustomer.value = null;
};

// Open edit dialog for a customer
const editCustomer = (customer) => {
  // Create a deep copy to avoid mutating the original
  editingCustomer.value = JSON.parse(JSON.stringify(customer));
  showEditDialog.value = true;
  formError.value = '';
};

// Close edit dialog
const closeEditDialog = () => {
  showEditDialog.value = false;
  editingCustomer.value = null;
  formError.value = '';
};

// Submit edited customer
const submitEditedCustomer = async () => {
  // Basic validation
  if (!editingCustomer.value.name || !editingCustomer.value.email) {
    formError.value = 'Name and email are required';
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(editingCustomer.value.email)) {
    formError.value = 'Please enter a valid email address';
    return;
  }
  
  try {
    await customerStore.updateCustomer(editingCustomer.value.id, editingCustomer.value);
    closeEditDialog();
  } catch (err) {
    formError.value = err.message || 'Failed to update customer';
  }
};

// Delete customer
const deleteCustomer = async (id) => {
  if (confirm('Are you sure you want to delete this customer?')) {
    try {
      await customerStore.deleteCustomer(id);
      closeEditDialog();
    } catch (err) {
      formError.value = err.message || 'Failed to delete customer';
    }
  }
};

// Close dialog on escape key
const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    if (showCreateDialog.value) toggleCreateDialog();
    if (showViewDialog.value) closeViewDialog();
    if (showEditDialog.value) closeEditDialog();
  }
};

// Submit new customer
const submitCustomer = async () => {
  // Basic validation
  if (!newCustomer.value.name || !newCustomer.value.email) {
    formError.value = 'Name and email are required';
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newCustomer.value.email)) {
    formError.value = 'Please enter a valid email address';
    return;
  }
  
  try {
    await customerStore.createCustomer(newCustomer.value);
    toggleCreateDialog();
  } catch (err) {
    formError.value = err.message;
  }
};
</script>

<template>
  <div class="customers">
    <div class="customers-header">
      <h1>Customers</h1>
      <button @click="toggleCreateDialog" class="btn primary">
        Add Customer
      </button>
    </div>
    
    <!-- Error display -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- Customers List -->
    <div class="customers-list">
      <div v-if="loading && !customers.length" class="loading-message">
        Loading customers...
      </div>
      
      <div v-else-if="!customers.length" class="empty-message">
        No customers yet. Add your first customer!
      </div>
      
      <table v-else class="customers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.id">
            <td>{{ customer.name }}</td>
            <td>{{ customer.email }}</td>
            <td>{{ customer.phone || 'N/A' }}</td>
            <td>{{ customer.company || 'N/A' }}</td>
            <td>{{ formatDate(customer.createdAt) }}</td>
            <td class="actions">
              <button class="btn small" @click="viewCustomer(customer)">View</button>
              <button class="btn small secondary" @click="editCustomer(customer)">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- CREATE Customer Dialog Modal -->
    <div v-if="showCreateDialog" class="modal-overlay" @click="toggleCreateDialog" @keydown="handleKeydown">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Add New Customer</h2>
          <button class="close-button" @click="toggleCreateDialog">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitCustomer">
            <div v-if="formError" class="form-error">{{ formError }}</div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="name">Name *</label>
                <input 
                  id="name" 
                  v-model="newCustomer.name" 
                  type="text" 
                  placeholder="Full Name"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="email">Email *</label>
                <input 
                  id="email" 
                  v-model="newCustomer.email" 
                  type="email" 
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="phone">Phone</label>
                <input 
                  id="phone" 
                  v-model="newCustomer.phone" 
                  type="tel" 
                  placeholder="Phone Number"
                />
              </div>
              
              <div class="form-group">
                <label for="company">Company</label>
                <input 
                  id="company" 
                  v-model="newCustomer.company" 
                  type="text" 
                  placeholder="Company Name"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="address">Address</label>
              <input 
                id="address" 
                v-model="newCustomer.address" 
                type="text" 
                placeholder="Full Address"
              />
            </div>
            
            <div class="form-group">
              <label for="notes">Notes</label>
              <textarea 
                id="notes" 
                v-model="newCustomer.notes" 
                placeholder="Additional notes..."
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="toggleCreateDialog" class="btn secondary">Cancel</button>
              <button type="submit" class="btn primary" :disabled="isCreating">
                {{ isCreating ? 'Creating...' : 'Create Customer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- VIEW Customer Dialog Modal -->
    <div v-if="showViewDialog" class="modal-overlay" @click="closeViewDialog" @keydown="handleKeydown">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Customer Details</h2>
          <button class="close-button" @click="closeViewDialog">&times;</button>
        </div>
        
        <div class="modal-body" v-if="selectedCustomer">
          <div class="customer-detail">
            <div class="detail-row">
              <div class="detail-label">Name:</div>
              <div class="detail-value">{{ selectedCustomer.name }}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Email:</div>
              <div class="detail-value">{{ selectedCustomer.email }}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Phone:</div>
              <div class="detail-value">{{ selectedCustomer.phone || 'N/A' }}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Company:</div>
              <div class="detail-value">{{ selectedCustomer.company || 'N/A' }}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Address:</div>
              <div class="detail-value">{{ selectedCustomer.address || 'N/A' }}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Notes:</div>
              <div class="detail-value detail-notes">{{ selectedCustomer.notes || 'No notes' }}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Created:</div>
              <div class="detail-value">{{ formatDate(selectedCustomer.createdAt) }}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Last Updated:</div>
              <div class="detail-value">{{ formatDate(selectedCustomer.updatedAt) }}</div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeViewDialog" class="btn secondary">Close</button>
            <button type="button" @click="editCustomer(selectedCustomer); closeViewDialog();" class="btn primary">
              Edit Customer
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- EDIT Customer Dialog Modal -->
    <div v-if="showEditDialog" class="modal-overlay" @click="closeEditDialog" @keydown="handleKeydown">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Customer</h2>
          <button class="close-button" @click="closeEditDialog">&times;</button>
        </div>
        
        <div class="modal-body" v-if="editingCustomer">
          <form @submit.prevent="submitEditedCustomer">
            <div v-if="formError" class="form-error">{{ formError }}</div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="edit-name">Name *</label>
                <input 
                  id="edit-name" 
                  v-model="editingCustomer.name" 
                  type="text" 
                  placeholder="Full Name"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="edit-email">Email *</label>
                <input 
                  id="edit-email" 
                  v-model="editingCustomer.email" 
                  type="email" 
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="edit-phone">Phone</label>
                <input 
                  id="edit-phone" 
                  v-model="editingCustomer.phone" 
                  type="tel" 
                  placeholder="Phone Number"
                />
              </div>
              
              <div class="form-group">
                <label for="edit-company">Company</label>
                <input 
                  id="edit-company" 
                  v-model="editingCustomer.company" 
                  type="text" 
                  placeholder="Company Name"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="edit-address">Address</label>
              <input 
                id="edit-address" 
                v-model="editingCustomer.address" 
                type="text" 
                placeholder="Full Address"
              />
            </div>
            
            <div class="form-group">
              <label for="edit-notes">Notes</label>
              <textarea 
                id="edit-notes" 
                v-model="editingCustomer.notes" 
                placeholder="Additional notes..."
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="deleteCustomer(editingCustomer.id)" class="btn danger">
                Delete
              </button>
              <div class="spacer"></div>
              <button type="button" @click="closeEditDialog" class="btn secondary">Cancel</button>
              <button type="submit" class="btn primary" :disabled="loading">
                {{ loading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customers {
  padding: 0 20px 20px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 0;
}

.customers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-top: 20px;
}

.error-message {
  background-color: #ffd2d2;
  color: #d8000c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.form-error {
  color: #d8000c;
  margin-bottom: 10px;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.spacer {
  flex: 1;
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
  background-color: #4361ee;
  color: white;
}

.btn.primary:hover {
  background-color: #3a56d4;
}

.btn.secondary {
  background-color: #e9ecef;
  color: #212529;
}

.btn.secondary:hover {
  background-color: #dde2e6;
}

.btn.danger {
  background-color: #dc3545;
  color: white;
}

.btn.danger:hover {
  background-color: #bd2130;
}

.btn.small {
  padding: 4px 8px;
  font-size: 12px;
}

.customers-table {
  width: 100%;
  border-collapse: collapse;
}

.customers-table th,
.customers-table td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
}

.customers-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 5px;
}

.loading-message,
.empty-message {
  text-align: center;
  padding: 30px;
  color: #6c757d;
}

/* Modal Styles */
.modal-overlay {
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

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
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

.modal-body {
  padding: 20px;
}

/* Customer Detail Styles */
.customer-detail {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.detail-label {
  width: 120px;
  font-weight: 600;
  color: #555;
}

.detail-value {
  flex: 1;
}

.detail-notes {
  white-space: pre-line;
}
</style> 