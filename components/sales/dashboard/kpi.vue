<template>
  <el-row :gutter="16">
    <el-col
      v-for="kpi in kpiList"
      :key="kpi.id"
      :xs="24"
      :sm="12"
      :md="8"
      :lg="4"
      class="mb-4"
    >
      <el-card
        class="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 h-full cursor-default"
        shadow="hover"
        :body-style="{ padding: '16px' }"
      >
        <div class="flex items-start justify-between">
          <div
            class="w-11 h-11 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
            :style="{ backgroundColor: kpi.color }"
          >
            <component :is="kpi.icon" :size="20" />
          </div>
          <div
            class="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
            :class="
              kpi.trend === 'up'
                ? 'bg-green-50 text-green-700'
                : kpi.trend === 'down'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-gray-100 text-gray-700'
            "
          >
            <TrendingUp v-if="kpi.trend === 'up'" :size="12" />
            <TrendingDown v-else-if="kpi.trend === 'down'" :size="12" />
            <Minus v-else :size="12" />
            {{ kpi.change }}
          </div>
        </div>

        <div class="mt-3">
          <div
            class="text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {{ kpi.title }}
          </div>
          <div class="text-xl font-bold text-gray-900 mt-1 truncate">
            {{ kpi.value }}
          </div>
        </div>

        <div
          class="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500"
        >
          <span>{{ kpi.sublabel }}</span>
          <span class="font-medium text-gray-700">{{ kpi.subvalue }}</span>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  Receipt,
  FileCheck,
  Truck,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-vue-next";
import { toRupiah } from "@/utils/number";

const props = defineProps({
  period: {
    type: String,
    default: "this-month",
  },
});

const kpiList = computed(() => [
  {
    id: "revenue",
    title: "Total Sales Revenue",
    value: toRupiah("3845000000"),
    change: "+14.8%",
    trend: "up",
    icon: DollarSign,
    color: "#019932",
    sublabel: "Target Achievement",
    subvalue: "106.8% (Target: Rp 3.6M)",
  },
  {
    id: "orders",
    title: "Total Sales Orders",
    value: "184 Orders",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    color: "#409EFF",
    sublabel: "Completed / Processing",
    subvalue: "142 / 36 orders",
  },
  {
    id: "conversion",
    title: "Quote Conversion",
    value: "68.5%",
    change: "+4.3%",
    trend: "up",
    icon: FileCheck,
    color: "#8E44AD",
    sublabel: "Converted Quotes",
    subvalue: "113 of 165 quotes",
  },
  {
    id: "aov",
    title: "Avg. Order Value",
    value: toRupiah("20896700"),
    change: "+6.1%",
    trend: "up",
    icon: CheckCircle2,
    color: "#E6A23C",
    sublabel: "Highest Single Order",
    subvalue: "Rp 320.000.000",
  },
  {
    id: "invoices",
    title: "Pending Invoices",
    value: toRupiah("524600000"),
    change: "-3.5%",
    trend: "down",
    icon: Receipt,
    color: "#F56C6C",
    sublabel: "Overdue Receivables",
    subvalue: "4 Invoices (Rp 98.2M)",
  },
  {
    id: "fulfillment",
    title: "On-Time Fulfillment",
    value: "95.4%",
    change: "+1.8%",
    trend: "up",
    icon: Truck,
    color: "#00A896",
    sublabel: "Avg. Lead Time",
    subvalue: "3.2 Days",
  },
]);
</script>
