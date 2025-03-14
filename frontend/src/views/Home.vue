<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard Overview</h1>
      <div class="search-container">
        <input type="text" placeholder="Search..." class="search-input" />
      </div>
    </div>
    
    <!-- Metrics Cards -->
    <div class="metrics-container">
      <div class="metric-card">
        <h3>Total Users</h3>
        <p class="metric-value">2,543</p>
      </div>
      
      <div class="metric-card">
        <h3>Active Projects</h3>
        <p class="metric-value">187</p>
      </div>
      
      <div class="metric-card">
        <h3>Revenue</h3>
        <p class="metric-value">$12,680</p>
      </div>
    </div>
    
    <!-- Performance Chart -->
    <div class="performance-card">
      <h2>Monthly Performance</h2>
      <div class="chart-container">
        <!-- Chart will be implemented with a proper chart library -->
        <div class="placeholder-chart"></div>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="activity-section">
      <h2>Recent Activity</h2>
      
      <div class="activity-item">
        <div class="activity-content">
          <p>New customer registration: ABC Corp</p>
        </div>
        <div class="activity-time">2h ago</div>
      </div>
      
      <div class="activity-item">
        <div class="activity-content">
          <p>Project "Marketing Campaign" updated</p>
        </div>
        <div class="activity-time">5h ago</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// We'll keep this simple for now, but in a real app we'd fetch this data from an API
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.search-container {
  width: 200px;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background-color: #f8f9fa;
}

.metrics-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.metric-card {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.metric-card h3 {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.metric-value {
  color: #1e293b;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
}

.performance-card {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.performance-card h2 {
  color: #1e293b;
  font-size: 18px;
  margin: 0 0 16px 0;
}

.placeholder-chart {
  height: 200px;
  background: linear-gradient(90deg, 
    #f5f0ff 0%, #7e3af2 20%, #9461fc 40%, 
    #7e3af2 60%, #9461fc 80%, #7e3af2 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.placeholder-chart::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 80%,
    #7e3af2 80%,
    #7e3af2 81%
  );
}

.activity-section {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.activity-section h2 {
  color: #1e293b;
  font-size: 18px;
  margin: 0 0 16px 0;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background-color: #f8f7ff;
}

.activity-item:last-child {
  margin-bottom: 0;
}

.activity-content p {
  margin: 0;
  color: #334155;
}

.activity-time {
  color: #64748b;
  font-size: 14px;
}
</style>