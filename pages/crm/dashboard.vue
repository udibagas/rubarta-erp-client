<template>
  <div class="flex flex-col gap-6">
    <!-- Page Header -->
    <el-card class="" shadow="never">
      <el-page-header @back="goBack" content="CRM Dashboard">
        <template #icon>
          <BarChart3 :size="24" />
        </template>
        <template #extra>
          <el-space>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="To"
              start-placeholder="Start date"
              end-placeholder="End date"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              @change="refreshData"
            >
              <template #prefix-icon>
                <Calendar :size="16" />
              </template>
            </el-date-picker>
            <el-button @click="refreshData" :loading="loading" type="primary">
              <template #icon>
                <RefreshCw :size="16" />
              </template>
              Refresh
            </el-button>
          </el-space>
        </template>
      </el-page-header>
    </el-card>

    <!-- KPI Cards -->
    <CrmDashboardKpi />

    <!-- Main Charts Section -->
    <el-row :gutter="20">
      <!-- Sales Pipeline -->
      <el-col :xs="24" :lg="12">
        <CrmDashboardSalesPipeline />
      </el-col>

      <!-- Revenue Trend -->
      <el-col :xs="24" :lg="12">
        <CrmDashboardRevenueTrend />
      </el-col>
    </el-row>

    <!-- Secondary Charts Section -->
    <el-row :gutter="20">
      <!-- Lead Sources -->
      <el-col :xs="24" :lg="8">
        <CrmDashboardLeadSources />
      </el-col>

      <!-- Customer Segments -->
      <el-col :xs="24" :lg="8">
        <CrmDashboardCustomerSegments />
      </el-col>

      <!-- Sales Performance -->
      <el-col :xs="24" :lg="8">
        <CrmDashboardSalesPerformance />
      </el-col>
    </el-row>

    <!-- Activities & Opportunities Section -->
    <el-row :gutter="20" class="mb-8">
      <!-- Recent Activities -->
      <el-col :xs="24" :lg="12">
        <CrmDashboardRecentActivities />
      </el-col>

      <!-- Top Opportunities -->
      <el-col :xs="24" :lg="12">
        <CrmDashboardTopOpportunities />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { BarChart3, Calendar, RefreshCw } from "lucide-vue-next";

// Reactive data
const loading = ref(false);
const dateRange = ref([]);

// Methods
const goBack = () => {
  navigateTo("/crm");
};

function refreshData() {
  loading.value = true;
  // Simulate data fetching
  setTimeout(() => {
    loading.value = false;
  }, 1000);
}

// Lifecycle
onMounted(() => {
  // Set default date range (last 30 days)
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  dateRange.value = [
    start.toISOString().split("T")[0],
    end.toISOString().split("T")[0],
  ];
});
</script>

<style scoped>
/* Custom height for chart containers */
.h-70 {
  height: 17.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-card,
.opportunity-card {
  border-radius: 12px;
  height: 100%;
}

.activity-item {
  padding: 0.5rem 0;
}

.activity-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.activity-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.activity-user {
  color: #9ca3af;
  font-size: 0.75rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .kpi-section-card,
  .charts-section-card,
  .secondary-charts-card,
  .bottom-section {
    margin-bottom: 1.5rem;
  }
  .chart-container {
    height: 280px;
  }

  .chart-container-small {
    height: 220px;
  }

  :deep(.el-card__body) {
    padding: 1rem;
  }

  .kpi-content {
    gap: 0.75rem;
  }

  .kpi-icon {
    width: 50px;
    height: 50px;
  }

  .kpi-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .header-card {
    margin-bottom: 1rem;
  }

  .section-header {
    font-size: 1rem;
  }

  .chart-container,
  .chart-container-small {
    height: 200px;
  }

  .kpi-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .kpi-icon {
    width: 40px;
    height: 40px;
  }

  .kpi-value {
    font-size: 1.25rem;
  }
}

/* Animation Classes */
.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #9ca3af;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .kpi-title {
    color: #9ca3af;
  }

  .kpi-value {
    color: #f3f4f6;
  }

  .activity-title {
    color: #f3f4f6;
  }

  .opp-name {
    color: #f3f4f6;
  }
}
</style>
