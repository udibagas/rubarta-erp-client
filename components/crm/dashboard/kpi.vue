<template>
  <el-row :gutter="20">
    <el-col :xs="24" :sm="12" :md="6" v-for="kpi in kpiData" :key="kpi.title">
      <el-card
        class="rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl mb-2"
        shadow="hover"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-15 h-15 rounded-xl flex items-center justify-center text-white shrink-0"
            :style="{ backgroundColor: kpi.color }"
          >
            <el-icon>
              <component :is="kpi.icon" :size="24" />
            </el-icon>
          </div>
          <div class="flex-1">
            <div class="text-sm text-gray-500 mb-1">{{ kpi.title }}</div>
            <div class="text-3xl font-bold text-gray-800 mb-1">
              {{ kpi.value }}
            </div>
            <div
              class="text-sm font-semibold flex items-center gap-1"
              :class="kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'"
            >
              <TrendingUp v-if="kpi.trend === 'up'" :size="16" />
              <TrendingUp
                v-if="kpi.trend === 'down'"
                :size="16"
                class="rotate-180"
              />
              {{ kpi.change }}
            </div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";
const request = useRequest();

import {
  TrendingUp,
  UserPlus,
  UsersRound,
  Handshake,
  ShoppingBag,
  FileText,
  ListChecks,
} from "lucide-vue-next";

const { data } = useQuery({
  queryKey: ["summary"],
  queryFn: () => request("/api/crm-dashboard/summary"),
});

const kpiData = computed(() => [
  {
    title: "Total Revenue",
    value: toCurrency(data.value?.totalRevenue ?? 0),
    // change: "+12.5%",
    // trend: "up",
    icon: TrendingUp,
    color: "#019932",
  },
  {
    title: "New Leads",
    value: data.value?.totalLeads ?? 0,
    // change: "+8.2%",
    // trend: "up",
    icon: UserPlus,
    color: "#409EFF",
  },
  {
    title: "Total Opportunities",
    value: toCurrency(data.value?.totalOpportunityValue ?? 0),
    // change: data.value?.totalOpportunity ?? 0,
    // trend: "down",
    icon: ElIconOpportunity,
    color: "#E6A23C",
  },
  {
    title: "Active Deals",
    value: data.value?.totalOpportunities,
    // change: "+15.3%",
    // trend: "up",
    icon: Handshake,
    color: "#9C27B0",
  },
  {
    title: "Total Customer",
    value: data.value?.totalCustomers,
    // change: "+15.3%",
    // trend: "up",
    icon: UsersRound,
    color: "#67C23A",
  },
  {
    title: "Total Quotations",
    value: data.value?.totalQuotations,
    // change: "+15.3%",
    // trend: "up",
    icon: FileText,
    color: "#8E44AD",
  },
  {
    title: "Total Orders",
    value: data.value?.totalOrders,
    // change: "+15.3%",
    // trend: "up",
    icon: ShoppingBag,
    color: "#17A2B8",
  },
  {
    title: "Pending Tasks",
    value: data.value?.totalOrders,
    // change: "+15.3%",
    // trend: "up",
    icon: ListChecks,
    color: "#FF9800",
  },
]);
</script>
