<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useCustomerStore } from '../stores/customers';
import CustomerDialog from '../components/customers/CustomerDialog.vue';

const customerStore = useCustomerStore();
const { 
  customers, 
  loading, 
  error,
  isCreating
} = customerStore;

// Modals state
const showCustomerDialog = ref(false);
const showViewDialog = ref(false);
const isEditMode = ref(false);

// Customer data
const selectedCustomer = ref(null);

// Track expanded customer cards
const expandedCards = ref({});

// Track action menu visibility 
const actionMenuVisible = ref({});

// Toggle card expansion
const toggleCardExpansion = (customerId) => {
  expandedCards.value[customerId] = !expandedCards.value[customerId];
};

// Toggle action menu
const toggleActionMenu = (event, customerId) => {
  event.stopPropagation();
  
  // Get the current state
  const isCurrentlyVisible = actionMenuVisible.value[customerId];
  
  // Close all other menus first
  closeAllActionMenus();
  
  // Toggle this menu (only set to true if it was false before)
  actionMenuVisible.value[customerId] = !isCurrentlyVisible;
  
  // If we're opening a menu, add a one-time event listener to close it when clicking elsewhere
  if (actionMenuVisible.value[customerId]) {
    setTimeout(() => {
      document.addEventListener('click', () => {
        actionMenuVisible.value[customerId] = false;
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

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Close all action menus when clicking outside 
const handleClickOutside = (event) => {
  // If click is on or inside action button, don't do anything
  // (the toggle action menu handler will take care of it)
  if (event.target.closest('.action-button')) {
    return;
  }
  
  // If click is on an action-menu-item, don't close menus
  // (they handle their own events)
  if (event.target.closest('.action-menu-item')) {
    return;
  }
  
  // Otherwise, close all menus
  closeAllActionMenus();
};

// Setup and cleanup event listeners
onMounted(() => {
  customerStore.fetchCustomers();
  // We're now handling menu clicks with individual listeners
  // document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  // document.removeEventListener('click', handleClickOutside);
});

// Open add dialog
const openAddDialog = () => {
  selectedCustomer.value = null;
  isEditMode.value = false;
  showCustomerDialog.value = true;
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
const openEditDialog = (customer) => {
  selectedCustomer.value = customer;
  isEditMode.value = true;
  showCustomerDialog.value = true;
};

// Close customer dialog
const closeCustomerDialog = () => {
  showCustomerDialog.value = false;
  isEditMode.value = false;
  selectedCustomer.value = null;
};

// Handle customer added event
const handleCustomerAdded = (customer) => {
  // You could add additional logic here if needed
};

// Handle customer updated event
const handleCustomerUpdated = (customer) => {
  // You could add additional logic here if needed
};

// Delete customer
const deleteCustomer = async (id) => {
  if (confirm('Are you sure you want to delete this customer?')) {
    try {
      await customerStore.deleteCustomer(id);
    } catch (err) {
      console.error('Failed to delete customer:', err);
    }
  }
};

// Handle keydown event
const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    if (showCustomerDialog.value) closeCustomerDialog();
    if (showViewDialog.value) closeViewDialog();
  }
};
</script>

<template>
  <div class="customers">
    <div class="customers-header">
      <h1>Customers</h1>
      <button @click="openAddDialog" class="btn primary">
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
      
      <div v-else>
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
          Showing {{ customers.length }} out of {{ customers.length }}
        </div>
      
        <div class="customer-cards">
          <div v-for="customer in customers" :key="customer.id" class="customer-card">
            <div class="card-header">
              <div class="expand-icon" @click="toggleCardExpansion(customer.id)">
                <span>{{ expandedCards[customer.id] ? '▼' : '►' }}</span>
              </div>
              <div class="customer-id" @click="toggleCardExpansion(customer.id)">{{ customer.name }}</div>
              <div class="card-actions">
                <button class="action-button" @click.stop="toggleActionMenu($event, customer.id)">
                  <span>⋮</span>
                </button>
                <div v-show="actionMenuVisible[customer.id]" class="action-menu">
                  <div class="action-menu-item" @click.stop="viewCustomer(customer)">View Details</div>
                  <div class="action-menu-item" @click.stop="openEditDialog(customer)">Edit</div>
                  <div class="action-menu-item danger" @click.stop="deleteCustomer(customer.id)">Delete</div>
                </div>
              </div>
            </div>
            
            <div v-if="expandedCards[customer.id]" class="card-details">
              <div class="detail-grid">
                <div class="detail-column">
                  <div class="detail-item">
                    <div class="detail-label">First name</div>
                    <div class="detail-value">{{ customer.name.split(' ')[0] || 'N/A' }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Last name</div>
                    <div class="detail-value">{{ customer.name.split(' ').slice(1).join(' ') || 'N/A' }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">{{ customer.email || 'N/A' }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">{{ customer.phone || 'N/A' }}</div>
                  </div>
                </div>
                
                <div class="detail-column">
                  <div class="detail-item">
                    <div class="detail-label">Company</div>
                    <div class="detail-value">{{ customer.company || 'N/A' }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Address</div>
                    <div class="detail-value">{{ customer.address || 'N/A' }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Added on</div>
                    <div class="detail-value">{{ customer.createdAt ? formatDate(customer.createdAt) : 'N/A' }}</div>
                  </div>
                </div>
              </div>
              
              <div class="detail-item notes">
                <div class="detail-label">Notes</div>
                <div class="detail-value">{{ customer.notes || 'No notes' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Detail View Dialog -->
    <div v-if="showViewDialog" class="dialog-overlay" @click="closeViewDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>Customer Details</h2>
          <button class="close-button" @click="closeViewDialog">&times;</button>
        </div>
        
        <div v-if="selectedCustomer" class="dialog-body">
          <div class="detail-view">
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
              <div class="detail-label">Added on:</div>
              <div class="detail-value">{{ selectedCustomer.createdAt ? formatDate(selectedCustomer.createdAt) : 'N/A' }}</div>
            </div>
            
            <div class="detail-row notes">
              <div class="detail-label">Notes:</div>
              <div class="detail-value">{{ selectedCustomer.notes || 'No notes' }}</div>
            </div>
          </div>
          
          <div class="dialog-actions">
            <button class="btn primary" @click="openEditDialog(selectedCustomer)">Edit Customer</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Customer Dialog (Add/Edit) -->
    <CustomerDialog
      :show="showCustomerDialog"
      :customer="selectedCustomer"
      :is-edit-mode="isEditMode"
      @close="closeCustomerDialog"
      @customer-added="handleCustomerAdded"
      @customer-updated="handleCustomerUpdated"
    />
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

.loading-message,
.empty-message {
  text-align: center;
  padding: 30px;
  color: #6c757d;
}

/* Customer Card Styles */
.customer-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.customer-card {
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

.customer-id {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.customer-id:hover {
  color: #4361ee;
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

.customer-avatar {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

/* Modal Styles */
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
  max-width: 600px;
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

.dialog-body {
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