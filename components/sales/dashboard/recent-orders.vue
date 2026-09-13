<template>
  <el-card class="rounded-xl border border-gray-100 shadow-sm" shadow="hover">
    <template #header>
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2">
          <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <ShoppingBag :size="18" />
          </div>
          <div>
            <div class="font-semibold text-gray-800 text-base">
              Latest Sales Orders
            </div>
            <div class="text-xs text-gray-500">
              Overview of the most recent orders placed
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <el-input
            v-model="searchQuery"
            placeholder="Search order # or customer..."
            size="small"
            clearable
            style="width: 220px"
          >
            <template #prefix>
              <Search :size="14" class="text-gray-400" />
            </template>
          </el-input>

          <el-button
            type="primary"
            size="small"
            plain
            @click="navigateTo('/sales/orders')"
          >
            View All Orders
            <ArrowUpRight :size="14" class="ml-1" />
          </el-button>
        </div>
      </div>
    </template>

    <div class="overflow-x-auto">
      <el-table :data="filteredOrders" style="width: 100%" size="default">
        <el-table-column label="Order #" min-width="140">
          <template #default="{ row }">
            <el-link
              type="success"
              class="font-mono font-semibold"
              @click="navigateTo(`/sales/orders`)"
            >
              {{ row.orderNumber }}
            </el-link>
            <div class="text-[11px] text-gray-400">
              {{ row.date }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Customer" min-width="200">
          <template #default="{ row }">
            <div class="font-semibold text-gray-800 text-xs truncate">
              {{ row.customerName }}
            </div>
            <div class="text-[11px] text-gray-400">
              Pic: {{ row.contactPerson }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Sales Rep" min-width="140">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <span
                class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                :style="{ backgroundColor: getAvatarColor(row.salesRep) }"
              >
                {{ row.salesRep.charAt(0) }}
              </span>
              <span class="text-xs text-gray-700">{{ row.salesRep }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Total Amount" min-width="150" align="right">
          <template #default="{ row }">
            <div class="font-mono font-bold text-xs text-gray-900">
              {{ row.formattedTotal }}
            </div>
            <div class="text-[11px] text-gray-400">
              {{ row.itemCount }} Items
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Order Status" min-width="130" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getOrderStatusTag(row.status)"
              size="small"
              effect="light"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Payment" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getPaymentStatusTag(row.paymentStatus)"
              size="small"
              effect="plain"
              class="rounded-full font-medium"
            >
              {{ row.paymentStatus }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Delivery" min-width="120" align="center">
          <template #default="{ row }">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
              :class="getDeliveryBadgeClass(row.deliveryStatus)"
            >
              {{ row.deliveryStatus }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="" width="80" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="navigateTo(`/sales/orders`)"
            >
              Detail
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ShoppingBag, Search, ArrowUpRight } from "lucide-vue-next";
import { toRupiah } from "@/utils/number";
import { getAvatarColor } from "@/utils/avatar";

const searchQuery = ref("");

const orders = [
  {
    id: 1,
    orderNumber: "SO-2026-0184",
    date: "13 Sep 2026",
    customerName: "PT Petrokimia Nusantara Tbk",
    contactPerson: "Ir. Hendra Gunawan",
    salesRep: "Budi Santoso",
    total: "345000000",
    formattedTotal: toRupiah("345000000"),
    itemCount: 14,
    status: "Processing",
    paymentStatus: "Partial",
    deliveryStatus: "In Transit",
  },
  {
    id: 2,
    orderNumber: "SO-2026-0183",
    date: "12 Sep 2026",
    customerName: "PT Wijaya Karya Industri",
    contactPerson: "Samsul Hadi",
    salesRep: "Siti Rahmawati",
    total: "189500000",
    formattedTotal: toRupiah("189500000"),
    itemCount: 8,
    status: "Completed",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
  },
  {
    id: 3,
    orderNumber: "SO-2026-0182",
    date: "12 Sep 2026",
    customerName: "PT Astra Heavy Industries",
    contactPerson: "Dennis Surya",
    salesRep: "Rian Hidayat",
    total: "520000000",
    formattedTotal: toRupiah("520000000"),
    itemCount: 22,
    status: "Processing",
    paymentStatus: "Unpaid",
    deliveryStatus: "Packaging",
  },
  {
    id: 4,
    orderNumber: "SO-2026-0181",
    date: "11 Sep 2026",
    customerName: "PT Trias Sentosa Tbk",
    contactPerson: "Anita Kusuma",
    salesRep: "Dewi Lestari",
    total: "76800000",
    formattedTotal: toRupiah("76800000"),
    itemCount: 4,
    status: "Completed",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
  },
  {
    id: 5,
    orderNumber: "SO-2026-0180",
    date: "10 Sep 2026",
    customerName: "PT Indofood CBP Sukses Makmur",
    contactPerson: "Bambang Pamungkas",
    salesRep: "Agus Pratama",
    total: "94200000",
    formattedTotal: toRupiah("94200000"),
    itemCount: 6,
    status: "Pending",
    paymentStatus: "Unpaid",
    deliveryStatus: "Pending",
  },
  {
    id: 6,
    orderNumber: "SO-2026-0179",
    date: "09 Sep 2026",
    customerName: "PT Semen Indonesia Tbk",
    contactPerson: "Wahyu Setiawan",
    salesRep: "Budi Santoso",
    total: "415000000",
    formattedTotal: toRupiah("415000000"),
    itemCount: 18,
    status: "Completed",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
  },
];

const filteredOrders = computed(() => {
  if (!searchQuery.value.trim()) return orders;
  const q = searchQuery.value.toLowerCase();
  return orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.salesRep.toLowerCase().includes(q),
  );
});

const getOrderStatusTag = (status: string) => {
  switch (status) {
    case "Completed":
      return "success";
    case "Processing":
      return "primary";
    case "Pending":
      return "warning";
    case "Cancelled":
      return "danger";
    default:
      return "info";
  }
};

const getPaymentStatusTag = (status: string) => {
  switch (status) {
    case "Paid":
      return "success";
    case "Partial":
      return "warning";
    case "Unpaid":
      return "danger";
    default:
      return "info";
  }
};

const getDeliveryBadgeClass = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "In Transit":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "Packaging":
      return "bg-purple-50 text-purple-700 border border-purple-200";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};
</script>
