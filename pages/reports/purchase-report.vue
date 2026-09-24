<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Purchase Orders Report">
        <template #extra>
          <div class="flex gap-2">
            <el-select
              v-model="supplierId"
              placeholder="All Vendors"
              filterable
              clearable
              class="w-52!"
              @change="refetch()"
            >
              <el-option
                v-for="supplier in supplierList"
                :key="supplier.id"
                :value="supplier.id"
                :label="supplier.name"
              />
              <template #prefix>
                <el-icon><ElIconOfficeBuilding /></el-icon>
              </template>
            </el-select>

            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="Start"
              end-placeholder="End"
              value-format="YYYY-MM-DD"
              format="DD-MMM-YYYY"
              class="w-70!"
              @change="
                {
                  refetch();
                }
              "
            />
          </div>
        </template>
      </el-page-header>
    </template>

    <div class="flex gap-2 mb-2">
      <!-- <el-card shadow="never" class="w-64!" v-loading="isPending">
        <div class="text-gray-500 text-sm">Total Purchases</div>
        <div class="text-2xl font-semibold font-mono mt-1">
          {{ toRupiah(String(data?.total ?? 0)) }}
        </div>
        <div class="text-gray-400 text-xs mt-1">
          {{ suppliers.length }} supplier(s)
        </div>
      </el-card> -->

      <el-card shadow="never" class="flex-1">
        <template #header>
          <div class="font-semibold text-gray-800 text-base">
            Top Suppliers by Purchase Total
          </div>
        </template>
        <div ref="barChartRef" class="h-60 w-full"></div>
      </el-card>

      <el-card shadow="never" class="flex-1">
        <template #header>
          <div class="font-semibold text-gray-800 text-base">
            Purchase Share by Supplier
          </div>
        </template>
        <div ref="pieChartRef" class="h-60 w-full"></div>
      </el-card>
    </div>

    <el-card shadow="never" body-class="p-0!">
      <template #header>
        <span>Purchase Orders by Supplier</span>
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
            <el-table :data="row.orders" class="ml-8" size="small">
              <el-table-column label="Order Date" min-width="120">
                <template #default="{ row: order }">
                  {{ formatDate(order.date) }}
                </template>
              </el-table-column>

              <el-table-column label="Order No." min-width="140">
                <template #default="{ row: order }">
                  <el-link
                    class="font-mono"
                    @click="
                      navigateTo(`/purchasing-logistics/orders/${order.id}`)
                    "
                    type="success"
                  >
                    {{ order.number }}
                  </el-link>
                </template>
              </el-table-column>

              <el-table-column
                label="Grand Total"
                width="200"
                align="right"
                header-align="right"
              >
                <template #default="{ row: order }">
                  <div class="font-mono font-semibold">
                    {{ toRupiah(order.grandTotal) }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                label="Status"
                width="160"
                align="center"
                header-align="center"
              >
                <template #default="{ row: order }">
                  <StatusTag
                    :status="order.status"
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
          label="Orders"
          width="100"
          align="center"
          header-align="center"
        >
          <template #default="{ row }">
            {{ row.orders.length }}
          </template>
        </el-table-column>

        <el-table-column
          label="Total"
          width="220"
          align="right"
          header-align="right"
        >
          <template #default="{ row }">
            <div class="font-mono font-semibold">
              {{ toRupiah(row.total) }}
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
import { gql } from "@apollo/client";

interface PurchaseOrderRow {
  id: number;
  number: string;
  date: string;
  status: string;
  grandTotal: number;
}

interface SupplierPurchase {
  supplierId: number;
  supplierName: string;
  total: number;
  orders: PurchaseOrderRow[];
}

definePageMeta({ layout: false });
const request = useRequest();
const search = ref("");
const supplierId = ref(null);
const dateRange = ref<[string, string] | null>(null);
const supplierList = ref<{ id: number; name: string }[]>([]);

const { data, isPending, refetch } = useQuery<{
  data: SupplierPurchase[];
  total: number;
}>({
  queryKey: ["purchase-report", supplierId.value, dateRange.value],
  queryFn: () =>
    request("/api/report/purchase-orders", {
      params: { supplierId: supplierId.value, dateRange: dateRange.value },
    }),
});

useGraphqlQuery<{ suppliers: { id: number; name: string }[] }>(gql`
  query {
    suppliers {
      id
      name
    }
  }
`).then((result) => {
  supplierList.value = result.data?.suppliers ?? [];
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
  [...suppliers.value].sort((a, b) => b.total - a.total).slice(0, 10),
);

const updateBarChart = () => {
  if (!barChartInstance) return;

  const items = topSuppliers.value;

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return "";
        const item = params[0];
        return `${item.name}<br/>${toRupiah(String(item.value))}`;
      },
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
      axisLabel: {
        color: "#9ca3af",
        fontSize: 11,
        formatter: (val: number) =>
          val >= 1000000 ? `Rp ${(val / 1000000).toFixed(0)}M` : `Rp ${val}`,
      },
      splitLine: { lineStyle: { color: "#f3f4f6", type: "dashed" } },
    },
    series: [
      {
        name: "Total",
        type: "bar",
        barMaxWidth: 40,
        itemStyle: { color: "#019932", borderRadius: [4, 4, 0, 0] },
        data: items.map((item) => item.total),
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
        `${params.name}<br/>${toRupiah(String(params.value))} (${params.percent}%)`,
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        name: "Total",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: { formatter: "{b}: {d}%" },
        data: suppliers.value.map((s) => ({
          name: s.supplierName,
          value: s.total,
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
