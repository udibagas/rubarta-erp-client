<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Outstanding Purchase Order">
        <template #extra>
          <form class="flex gap-2" @submit.prevent>
            <el-input
              v-model="search"
              placeholder="Cari Supplier"
              style="width: 220px"
              :prefix-icon="ElIconSearch"
              :clearable="true"
            />
          </form>
        </template>
      </el-page-header>
    </template>

    <div class="flex gap-2 mb-2">
      <el-card shadow="never" class="w-64!" v-loading="isPending">
        <div class="text-gray-500 text-sm">Total Outstanding Items</div>
        <div class="text-2xl font-semibold font-mono mt-1">
          {{ data?.totalOutstandingItemCount ?? 0 }}
        </div>
        <div class="text-gray-400 text-xs mt-1">
          {{ suppliers.length }} supplier(s)
        </div>
      </el-card>

      <el-card shadow="never" class="w-64!" v-loading="isPending">
        <div class="text-gray-500 text-sm">Total Outstanding Quantity</div>
        <div class="text-2xl font-semibold font-mono mt-1">
          {{ data?.totalOutstandingQuantity ?? 0 }}
        </div>
      </el-card>

      <el-card shadow="never" class="flex-1">
        <template #header>
          <div class="font-semibold text-gray-800 text-base">
            Top Suppliers by Outstanding Quantity
          </div>
        </template>
        <div ref="barChartRef" class="h-60 w-full"></div>
      </el-card>

      <el-card shadow="never" class="flex-1">
        <template #header>
          <div class="font-semibold text-gray-800 text-base">
            Outstanding Item Share by Supplier
          </div>
        </template>
        <div ref="pieChartRef" class="h-60 w-full"></div>
      </el-card>
    </div>

    <el-card shadow="never" body-class="p-0!">
      <template #header>
        <span>Outstanding Purchase Orders by Supplier</span>
      </template>

      <el-table
        stripe
        v-loading="isPending"
        :data="filteredSuppliers"
        row-key="supplierId"
      >
        <template #empty>
          <el-empty description="No Items"> </el-empty>
        </template>

        <el-table-column type="expand">
          <template #default="{ row }">
            <el-table :data="row.items" class="ml-8" size="small">
              <el-table-column label="Order Date" min-width="120">
                <template #default="{ row: item }">
                  {{ formatDate(item.purchaseOrderDate) }}
                </template>
              </el-table-column>

              <el-table-column label="Order No." min-width="140">
                <template #default="{ row: item }">
                  <el-link
                    class="font-mono"
                    @click="
                      navigateTo(
                        `/purchasing-logistics/orders/${item.purchaseOrderId}`,
                      )
                    "
                    type="success"
                  >
                    {{ item.purchaseOrderNumber }}
                  </el-link>
                </template>
              </el-table-column>

              <el-table-column label="Part No." min-width="120">
                <template #default="{ row: item }">
                  <div class="font-mono">{{ item.partNumber }}</div>
                </template>
              </el-table-column>

              <el-table-column label="Description" min-width="180">
                <template #default="{ row: item }">
                  <div class="line-clamp-1">{{ item.description }}</div>
                </template>
              </el-table-column>

              <el-table-column
                label="Ordered"
                width="100"
                align="right"
                header-align="right"
              >
                <template #default="{ row: item }">
                  {{ item.orderedQuantity }}
                </template>
              </el-table-column>

              <el-table-column
                label="Received"
                width="100"
                align="right"
                header-align="right"
              >
                <template #default="{ row: item }">
                  {{ item.receivedQuantity }}
                </template>
              </el-table-column>

              <el-table-column
                label="Outstanding"
                width="110"
                align="right"
                header-align="right"
              >
                <template #default="{ row: item }">
                  <div class="font-mono font-semibold">
                    {{ item.outstandingQuantity }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                label="Status"
                width="140"
                align="center"
                header-align="center"
              >
                <template #default="{ row: item }">
                  <StatusTag
                    :status="item.purchaseOrderStatus"
                    effect="light"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <el-table-column label="Supplier" min-width="240">
          <template #default="{ row }">
            <div class="line-clamp-1">{{ row.supplierName }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="Outstanding Items"
          width="160"
          align="center"
          header-align="center"
        >
          <template #default="{ row }">
            {{ row.outstandingItemCount }}
          </template>
        </el-table-column>

        <el-table-column
          label="Outstanding Quantity"
          width="180"
          align="right"
          header-align="right"
        >
          <template #default="{ row }">
            <div class="font-mono font-semibold">
              {{ row.outstandingQuantity }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </nuxt-layout>
</template>

<script lang="ts" setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { useQuery } from "@tanstack/vue-query";
import * as echarts from "echarts";
import { formatDate } from "@/utils/date";

interface OutstandingPurchaseOrderItem {
  purchaseOrderId: number;
  purchaseOrderNumber: string;
  purchaseOrderDate: string;
  purchaseOrderStatus: string;
  purchaseOrderItemId: number;
  partNumber: string;
  description: string;
  orderedQuantity: number;
  receivedQuantity: number;
  outstandingQuantity: number;
}

interface OutstandingPurchaseOrderSupplier {
  supplierId: number;
  supplierName: string;
  outstandingItemCount: number;
  outstandingQuantity: number;
  items: OutstandingPurchaseOrderItem[];
}

interface OutstandingPurchaseOrderReport {
  data: OutstandingPurchaseOrderSupplier[];
  totalOutstandingItemCount: number;
  totalOutstandingQuantity: number;
}

definePageMeta({ layout: false });

const request = useRequest();
const search = ref("");

const { data, isPending, refetch } = useQuery<OutstandingPurchaseOrderReport>({
  queryKey: ["outstanding-purchase-order"],
  queryFn: () => request("/api/report/outstanding-purchase-orders"),
});

const suppliers = computed(() => data.value?.data ?? []);

const filteredSuppliers = computed(() => {
  if (!search.value) return suppliers.value;
  const keyword = search.value.toLowerCase();
  return suppliers.value.filter((s) =>
    s.supplierName.toLowerCase().includes(keyword),
  );
});

const barChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
let barChartInstance: echarts.ECharts | null = null;
let pieChartInstance: echarts.ECharts | null = null;

const topSuppliers = computed(() =>
  [...suppliers.value]
    .sort((a, b) => b.outstandingQuantity - a.outstandingQuantity)
    .slice(0, 10),
);

const updateBarChart = () => {
  if (!barChartInstance) return;

  const items = topSuppliers.value;

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "3%",
      top: "8%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: items.map((item) => item.supplierName),
      axisLabel: { color: "#6b7280", fontSize: 11, interval: 0, rotate: 30 },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#9ca3af", fontSize: 11 },
      splitLine: { lineStyle: { color: "#f3f4f6", type: "dashed" } },
    },
    series: [
      {
        name: "Outstanding Quantity",
        type: "bar",
        barMaxWidth: 40,
        itemStyle: { color: "#019932", borderRadius: [4, 4, 0, 0] },
        data: items.map((item) => item.outstandingQuantity),
      },
    ],
  };

  barChartInstance.setOption(option, true);
};

const updatePieChart = () => {
  if (!pieChartInstance) return;

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: any) =>
        `${params.name}<br/>${params.value} item(s) (${params.percent}%)`,
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        name: "Outstanding Items",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: { formatter: "{b}: {d}%" },
        data: suppliers.value.map((s) => ({
          name: s.supplierName,
          value: s.outstandingItemCount,
        })),
      },
    ],
  };

  pieChartInstance.setOption(option, true);
};

watch(topSuppliers, () => updateBarChart());
watch(suppliers, () => updatePieChart());

const resizeHandler = () => {
  barChartInstance?.resize();
  pieChartInstance?.resize();
};

onMounted(async () => {
  await nextTick();
  if (barChartRef.value) {
    barChartInstance = echarts.init(barChartRef.value);
    updateBarChart();
  }
  if (pieChartRef.value) {
    pieChartInstance = echarts.init(pieChartRef.value);
    updatePieChart();
  }
  window.addEventListener("resize", resizeHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeHandler);
  barChartInstance?.dispose();
  pieChartInstance?.dispose();
  barChartInstance = null;
  pieChartInstance = null;
});
</script>
