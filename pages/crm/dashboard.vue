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
        <el-card class="rounded-xl h-full" shadow="hover">
          <template #header>
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2 font-semibold">
                <Activity :size="18" class="text-green-600" />
                <span>Recent Activities</span>
              </div>
              <el-button text size="small" @click="viewAllActivities">
                View All
                <ArrowRight :size="14" />
              </el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="activity.timestamp"
              placement="top"
              :color="activity.color"
            >
              <div class="py-2">
                <div class="font-semibold text-gray-800 mb-1">
                  {{ activity.title }}
                </div>
                <div class="text-gray-500 text-sm mb-1">
                  {{ activity.description }}
                </div>
                <div class="text-gray-400 text-xs">{{ activity.user }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <!-- Top Opportunities -->
      <el-col :xs="24" :lg="12">
        <el-card class="rounded-xl h-full" shadow="hover">
          <template #header>
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2 font-semibold">
                <Briefcase :size="18" class="text-green-600" />
                <span>Top Opportunities</span>
              </div>
              <el-button text size="small" @click="viewAllOpportunities">
                View All
                <ArrowRight :size="14" />
              </el-button>
            </div>
          </template>
          <el-table :data="topOpportunities" style="width: 100%" size="small">
            <el-table-column prop="name" label="Opportunity" min-width="120">
              <template #default="{ row }">
                <div>
                  <div class="font-semibold text-gray-800 text-sm">
                    {{ row.name }}
                  </div>
                  <div class="text-gray-500 text-xs">{{ row.company }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="Value" align="right">
              <template #default="{ row }">
                <span class="font-semibold text-emerald-600"
                  >${{ formatNumber(row.value) }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="stage" label="Stage">
              <template #default="{ row }">
                <el-tag :type="getStageType(row.stage)" size="small">
                  {{ row.stage }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="probability"
              label="Probability"
              align="center"
            >
              <template #default="{ row }">
                <el-progress
                  :percentage="row.probability"
                  :color="getProgressColor(row.probability)"
                  :stroke-width="8"
                  :show-text="false"
                />
                <span class="text-xs text-gray-500 ml-2"
                  >{{ row.probability }}%</span
                >
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
import {
  BarChart3,
  Calendar,
  RefreshCw,
  ArrowRight,
  Activity,
  Briefcase,
} from "lucide-vue-next";

// Reactive data
const loading = ref(false);
const dateRange = ref([]);

// Recent Activities
const recentActivities = ref([
  {
    id: 1,
    title: "New lead created",
    description: "ABC Corp - Enterprise software inquiry",
    user: "John Smith",
    timestamp: "2 hours ago",
    color: "#019932",
  },
  {
    id: 2,
    title: "Deal closed",
    description: "XYZ Ltd - $50,000 annual contract",
    user: "Sarah Johnson",
    timestamp: "4 hours ago",
    color: "#409EFF",
  },
  {
    id: 3,
    title: "Meeting scheduled",
    description: "Demo with Tech Solutions Inc",
    user: "Mike Wilson",
    timestamp: "6 hours ago",
    color: "#E6A23C",
  },
  {
    id: 4,
    title: "Follow-up completed",
    description: "Proposal sent to Global Systems",
    user: "Lisa Davis",
    timestamp: "1 day ago",
    color: "#909399",
  },
]);

// Top Opportunities
const topOpportunities = ref([
  {
    id: 1,
    name: "Enterprise CRM System",
    company: "TechCorp Ltd",
    value: 150000,
    stage: "Proposal",
    probability: 75,
  },
  {
    id: 2,
    name: "Cloud Migration Project",
    company: "Global Systems",
    value: 250000,
    stage: "Negotiation",
    probability: 85,
  },
  {
    id: 3,
    name: "Digital Transformation",
    company: "Innovation Inc",
    value: 180000,
    stage: "Qualification",
    probability: 45,
  },
  {
    id: 4,
    name: "Software Licensing",
    company: "Business Solutions",
    value: 95000,
    stage: "Proposal",
    probability: 60,
  },
  {
    id: 5,
    name: "IT Consulting Services",
    company: "StartupX",
    value: 75000,
    stage: "Discovery",
    probability: 30,
  },
]);

// Methods
const goBack = () => {
  navigateTo("/crm");
};

const refreshData = async () => {
  loading.value = true;
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Update charts
  updateAllCharts();
  loading.value = false;
};

// Utility functions
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

const getStageType = (stage) => {
  const types = {
    Discovery: "info",
    Qualification: "warning",
    Proposal: "primary",
    Negotiation: "success",
    "Closed Won": "success",
    "Closed Lost": "danger",
  };
  return types[stage] || "info";
};

const getProgressColor = (percentage) => {
  if (percentage >= 80) return "#67C23A";
  if (percentage >= 60) return "#019932";
  if (percentage >= 40) return "#E6A23C";
  return "#F56C6C";
};

const viewAllActivities = () => {
  navigateTo("/crm/interactions");
};

const viewAllOpportunities = () => {
  navigateTo("/crm/opportunities");
};

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

/* Opportunities Table */
.opp-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.opp-company {
  color: #6b7280;
  font-size: 0.75rem;
}

.opp-value {
  font-weight: 600;
  color: #059669;
}

.progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: 0.5rem;
}

/* Element Plus Overrides */
:deep(.el-card__header) {
  padding: 1.25rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.el-card__body) {
  padding: 1.5rem;
}

:deep(.el-page-header__content) {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

:deep(.el-timeline-item__timestamp) {
  color: #9ca3af;
  font-size: 0.75rem;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f3f4f6;
  padding: 0.75rem 1rem;
}

:deep(.el-table tbody tr:hover > td) {
  background-color: #f9fafb;
}

:deep(.el-progress-bar) {
  margin-right: 0;
}

:deep(.el-tag) {
  border: none;
  font-weight: 500;
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
