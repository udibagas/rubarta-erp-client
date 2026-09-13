<template>
  <el-card
    class="rounded-xl border border-gray-100 shadow-sm h-full"
    shadow="hover"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Activity :size="18" />
          </div>
          <div>
            <div class="font-semibold text-gray-800 text-base">
              Recent Sales Activities
            </div>
            <div class="text-xs text-gray-500">
              Real-time audit of sales orders, quotes & deliveries
            </div>
          </div>
        </div>

        <el-select
          v-model="selectedType"
          size="small"
          placeholder="Filter Type"
          style="width: 130px"
        >
          <el-option label="All Types" value="ALL" />
          <el-option label="Sales Orders" value="ORDER" />
          <el-option label="Quotations" value="QUOTATION" />
          <el-option label="Invoices" value="INVOICE" />
          <el-option label="Deliveries" value="DELIVERY" />
        </el-select>
      </div>
    </template>

    <div class="flow-root">
      <ul role="list" class="-mb-8">
        <li
          v-for="(act, actIdx) in filteredActivities"
          :key="act.id"
          class="relative pb-6"
        >
          <span
            v-if="actIdx !== filteredActivities.length - 1"
            class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100"
            aria-hidden="true"
          ></span>
          <div class="relative flex items-start space-x-3">
            <div>
              <span
                class="h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm"
                :class="act.iconBg"
              >
                <component
                  :is="act.icon"
                  class="h-4 w-4 text-white"
                  aria-hidden="true"
                />
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <div class="text-xs font-semibold text-gray-800">
                  <span
                    class="hover:text-emerald-600 transition-colors cursor-pointer"
                    @click="handleAction(act)"
                  >
                    {{ act.title }}
                  </span>
                </div>
                <div class="text-[11px] text-gray-400 whitespace-nowrap">
                  {{ act.timeAgo }}
                </div>
              </div>

              <div class="mt-0.5 text-xs text-gray-600">
                {{ act.description }}
              </div>

              <div class="mt-1.5 flex items-center gap-2 flex-wrap text-[11px]">
                <span
                  v-if="act.customer"
                  class="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium"
                >
                  🏢 {{ act.customer }}
                </span>
                <span
                  v-if="act.amount"
                  class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold font-mono"
                >
                  {{ act.amount }}
                </span>
                <span class="text-gray-400">
                  by <span class="text-gray-600">{{ act.user }}</span>
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Activity,
  ShoppingCart,
  FileText,
  Receipt,
  Truck,
  CheckCircle2,
} from "lucide-vue-next";
import { toRupiah } from "@/utils/number";

const selectedType = ref("ALL");

const activities = [
  {
    id: 1,
    type: "ORDER",
    title: "New Sales Order Confirmed (#SO-2026-0184)",
    description: "Order confirmed and approved for production dispatch",
    customer: "PT Petrokimia Nusantara",
    amount: toRupiah("345000000"),
    user: "Budi Santoso",
    timeAgo: "12 mins ago",
    link: "/sales/orders",
    icon: ShoppingCart,
    iconBg: "bg-emerald-600",
  },
  {
    id: 2,
    type: "INVOICE",
    title: "Invoice Paid in Full (#INV-2026-0092)",
    description: "Payment received via Mandiri Virtual Account",
    customer: "PT Wijaya Karya Industri",
    amount: toRupiah("128500000"),
    user: "Finance Dept",
    timeAgo: "45 mins ago",
    link: "/sales/invoices",
    icon: CheckCircle2,
    iconBg: "bg-green-600",
  },
  {
    id: 3,
    type: "QUOTATION",
    title: "Quotation Sent to Client (#SQ-2026-0245)",
    description: "Proposal for High Pressure Pipe fittings submitted",
    customer: "PT Astra Heavy Industries",
    amount: toRupiah("520000000"),
    user: "Siti Rahmawati",
    timeAgo: "2 hours ago",
    link: "/sales/quotations",
    icon: FileText,
    iconBg: "bg-blue-500",
  },
  {
    id: 4,
    type: "DELIVERY",
    title: "Delivery Order Dispatched (#DO-2026-0078)",
    description: "Batch shipment dispatched from Cikarang Warehouse",
    customer: "PT Trias Sentosa Tbk",
    amount: null,
    user: "Logistics Team",
    timeAgo: "3 hours ago",
    link: "/purchasing-logistics/delivery-orders",
    icon: Truck,
    iconBg: "bg-teal-600",
  },
  {
    id: 5,
    type: "QUOTATION",
    title: "Quotation Approved (#SQ-2026-0239)",
    description: "Special pricing discount approved by Director",
    customer: "PT Indofood CBP Sukses",
    amount: toRupiah("88400000"),
    user: "Dewi Lestari",
    timeAgo: "5 hours ago",
    link: "/sales/quotations",
    icon: Receipt,
    iconBg: "bg-purple-500",
  },
];

const filteredActivities = computed(() => {
  if (selectedType.value === "ALL") return activities;
  return activities.filter((act) => act.type === selectedType.value);
});

const handleAction = (act: any) => {
  if (act.link) {
    navigateTo(act.link);
  }
};
</script>
