<template>
  <nuxt-layout name="default">
    <template #header>
      <div
        class="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <el-page-header @back="goBack">
            <template #content>
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold text-gray-900"
                  >Sales Dashboard</span
                >
                <el-tag
                  size="small"
                  type="success"
                  effect="plain"
                  class="rounded-full font-medium"
                >
                  Live Analytics
                </el-tag>
              </div>
            </template>
          </el-page-header>
          <div class="text-xs text-gray-500 mt-1 ml-9">
            Monitor real-time sales pipeline, order fulfillment, revenue
            targets, and sales team achievements.
          </div>
        </div>

        <!-- Filters & Actions Header Bar -->
        <div class="flex items-center gap-2 flex-wrap">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            format="DD-MMM-YYYY"
            value-format="YYYY-MM-DD"
            size="default"
            style="width: 250px"
            @change="handleFilterChange"
          />

          <el-button
            type="default"
            :loading="isRefreshing"
            @click="refreshDashboard"
          >
            <template #icon>
              <RefreshCw :size="15" />
            </template>
            Refresh
          </el-button>
        </div>
      </div>
    </template>

    <!-- Main Dashboard Container -->
    <div class="p-2 space-y-6" v-loading="isRefreshing || isPending">
      <!-- 1. KPI Statistic Cards -->
      <section>
        <SalesDashboardKpi :data="data" />
      </section>

      <!-- 2. Revenue Chart & Order Status Distribution -->
      <section>
        <el-row :gutter="16">
          <el-col :xs="24" :lg="15" class="mb-4 lg:mb-0">
            <SalesDashboardRevenueTrend />
          </el-col>
          <el-col :xs="24" :lg="9">
            <SalesDashboardOrderStatus :data="data" />
          </el-col>
        </el-row>
      </section>

      <!-- 3. Top Products & Sales Rep Performance -->
      <section>
        <el-row :gutter="16">
          <el-col :xs="24" :lg="12" class="mb-4 lg:mb-0">
            <SalesDashboardTopProducts :data="data" />
          </el-col>
          <el-col :xs="24" :lg="12">
            <SalesDashboardSalesPerformance :data="data" />
          </el-col>
        </el-row>
      </section>

      <!-- 4. Recent Sales Orders & Activities Feed -->
      <section>
        <el-row :gutter="16">
          <el-col :xs="24" :xl="16" class="mb-4 xl:mb-0">
            <SalesDashboardRecentOrders :data="data" />
            <br />
          </el-col>
          <el-col :xs="24" :xl="8">
            <SalesDashboardRecentActivities :data="data" />
          </el-col>
        </el-row>
      </section>
    </div>
  </nuxt-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { RefreshCw, Download, Plus } from "lucide-vue-next";
import { ElMessage } from "element-plus";
import { useQuery } from "@tanstack/vue-query";
import type { SalesDashboardData } from "@/types/salesDashboard.types";

// Define page layout
definePageMeta({
  layout: false,
});

const request = useRequest();

// State
const selectedBranch = ref("ALL");
const selectedPeriod = ref("this-month");
const dateRange = ref<string[]>([]);
const isRefreshing = ref(false);

const { data, isPending } = useQuery<SalesDashboardData>({
  queryKey: ["sales-dashboard", selectedBranch.value, selectedPeriod.value],
  queryFn: () => request(`/api/sales-dashboard/summary`),
});

const handleFilterChange = () => {
  refreshDashboard();
};

const refreshDashboard = () => {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    ElMessage({
      message: "Sales dashboard data updated successfully",
      type: "success",
      duration: 2000,
    });
  }, 600);
};

const handleExport = (format: string) => {
  ElMessage({
    message: `Exporting sales report as ${format.toUpperCase()}...`,
    type: "info",
    duration: 2500,
  });
};

onMounted(() => {
  // Initialize default date range for the current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const startStr = firstDay.toISOString().split("T")[0] || "";
  const endStr = today.toISOString().split("T")[0] || "";
  dateRange.value = [startStr, endStr];
});
</script>

<style scoped>
:deep(.el-card__header) {
  padding: 14px 18px;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.el-table th.el-table__cell) {
  background-color: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  font-size: 12px;
}
</style>
