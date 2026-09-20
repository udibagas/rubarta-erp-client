<template>
  <el-row :gutter="16">
    <el-col
      v-for="kpi in kpiList"
      :key="kpi.id"
      :xs="24"
      :sm="12"
      :md="8"
      :lg="8"
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
            class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
          >
            {{ kpi.count }} Docs
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
          <span>Total Value</span>
          <span class="font-medium text-gray-700">{{ kpi.subvalue }}</span>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  FileText,
  ShoppingCart,
  Truck,
  Receipt,
  ClipboardList,
  PackageCheck,
} from "lucide-vue-next";
import { toRupiah } from "@/utils/number";
import type { SalesDashboardData } from "@/types/salesDashboard.types";

const props = defineProps<{
  data?: SalesDashboardData | null;
}>();

const kpiList = computed(() => {
  const totals = props.data?.totals;

  return [
    {
      id: "quotations",
      title: "Quotations",
      count: totals?.quotations?.count ?? 0,
      value: `${totals?.quotations?.count ?? 0} Quotations`,
      subvalue: toRupiah(String(totals?.quotations?.amount ?? 0)),
      icon: FileText,
      color: "#8E44AD",
    },
    {
      id: "salesOrders",
      title: "Sales Orders",
      count: totals?.salesOrders?.count ?? 0,
      value: `${totals?.salesOrders?.count ?? 0} Orders`,
      subvalue: toRupiah(String(totals?.salesOrders?.amount ?? 0)),
      icon: ShoppingCart,
      color: "#409EFF",
    },
    {
      id: "deliveryOrders",
      title: "Delivery Orders",
      count: totals?.deliveryOrders?.count ?? 0,
      value: `${totals?.deliveryOrders?.count ?? 0} Deliveries`,
      subvalue: toRupiah(String(totals?.deliveryOrders?.amount ?? 0)),
      icon: Truck,
      color: "#17A2B8",
    },
    {
      id: "invoices",
      title: "Invoices",
      count: totals?.invoices?.count ?? 0,
      value: toRupiah(String(totals?.invoices?.amount ?? 0)),
      subvalue: `${totals?.invoices?.count ?? 0} Invoices`,
      icon: Receipt,
      color: "#019932",
    },
    {
      id: "purchaseOrders",
      title: "Purchase Orders",
      count: totals?.purchaseOrders?.count ?? 0,
      value: `${totals?.purchaseOrders?.count ?? 0} Orders`,
      subvalue: toRupiah(String(totals?.purchaseOrders?.amount ?? 0)),
      icon: ClipboardList,
      color: "#E6A23C",
    },
    {
      id: "goodsReceipts",
      title: "Goods Receipts",
      count: totals?.goodsReceipts?.count ?? 0,
      value: `${totals?.goodsReceipts?.count ?? 0} Receipts`,
      subvalue: toRupiah(String(totals?.goodsReceipts?.amount ?? 0)),
      icon: PackageCheck,
      color: "#9C27B0",
    },
  ];
});
</script>
