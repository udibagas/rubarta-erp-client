<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Sales Report">
        <template #extra>
          <div class="flex items-center gap-2">
            <el-select
              v-model="(filters as Record<string, any>).customerId"
              placeholder="All Customer"
              filterable
              clearable
              class="w-52!"
              @change="
                {
                  refetch();
                  refreshTable();
                }
              "
            >
              <el-option
                v-for="customer in customers"
                :key="customer.id"
                :value="customer.id"
                :label="customer.name"
              />
              <template #prefix>
                <el-icon><ElIconOfficeBuilding /></el-icon>
              </template>
            </el-select>

            <el-date-picker
              v-model="(filters as Record<string, any>).dateRange"
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
                  refreshTable();
                }
              "
            />
          </div>
        </template>
      </el-page-header>
    </template>

    <div class="flex gap-2 mb-2">
      <el-card shadow="never" class="flex-1">
        <template #header>
          <div class="font-semibold text-gray-800 text-base">
            Revenue per Month
          </div>
        </template>
        <div ref="columnChartRef" class="h-60 w-full"></div>
      </el-card>

      <el-card shadow="never" class="flex-1">
        <template #header>
          <div class="font-semibold text-gray-800 text-base">
            Revenue by Customer
          </div>
        </template>
        <div ref="pieChartRef" class="h-60 w-full"></div>
      </el-card>
    </div>

    <el-card shadow="never" body-class="p-0!">
      <template #header>
        <div class="flex gap-4 items-center justify-between">
          <span> Sales Orders </span>

          <div class="flex items-center gap-2">
            <el-dropdown split-button @command="handleExport">
              <el-icon class="mr-1"><ElIconDownload /></el-icon>
              Export
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="excel" :icon="ElIconMemo">
                    Excel
                  </el-dropdown-item>
                  <el-dropdown-item command="pdf" :icon="ElIconDocument">
                    PDF
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <el-table stripe v-loading="isPending" :data="sales?.data ?? []">
        <template #empty>
          <el-empty description="No Items"> </el-empty>
        </template>
        <el-table-column label="Order Date" prop="date" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="Order No." prop="number" min-width="120">
          <template #default="{ row }">
            <el-link
              class="font-mono font-semibold!"
              @click="navigateTo(`/sales/orders/${row.id}`)"
              type="success"
            >
              {{ row.number }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="Customer" min-width="200">
          <template #default="{ row }">
            <div class="line-clamp-1">
              {{ row.Customer?.name || "-" }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Reference No." min-width="140">
          <template #default="{ row }">
            <div class="font-mono">{{ row.referenceNumber }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="Grand Total"
          width="180"
          align="right"
          header-align="right"
        >
          <template #default="{ row }">
            <div class="font-mono font-semibold">
              {{ toCurrency(row.grandTotal, row.currency) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="Status"
          prop="status"
          width="120"
          align="center"
          header-align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <StatusTag
              :status="row.status"
              effect="light"
              style="width: 100%"
            />
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="p-2 bg-slate-100"
        v-if="sales?.total"
        :current-page="page"
        size="small"
        background
        layout="total, sizes, prev, pager, next"
        :page-size="pageSize"
        :page-sizes="[10, 25, 50, 100]"
        :total="sales?.total"
        @current-change="currentChange"
        @size-change="sizeChange"
      />
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

interface CustomerMonthlyRevenue {
  customerId: number;
  customerName: string;
  month: string;
  total: number;
}

definePageMeta({ layout: false });

const request = useRequest();
const config = useRuntimeConfig();
const customers = ref<{ id: number; name: string }[]>([]);

const { fetchData, page, pageSize, filters, currentChange, sizeChange } =
  useCrud({
    url: "/api/sales-orders",
    queryKey: "orders",
    defaultQuery: {},
  });

const { isPending, data: sales, refetch: refreshTable } = fetchData();

const { data, refetch } = useQuery<{
  data: CustomerMonthlyRevenue[];
  total: number;
}>({
  queryKey: ["sales-report"],
  queryFn: () => {
    return request("/api/report/customer-monthly-revenue", {
      params: {
        customerId: (filters.value as Record<string, any>).customerId,
        dateRange: (filters.value as Record<string, any>).dateRange,
      },
    });
  },
});

const rows = computed(() => data.value?.data ?? []);

useGraphqlQuery<{ customers: { id: number; name: string }[] }>(gql`
  query {
    customers {
      id
      name
    }
  }
`).then((result) => {
  customers.value = result.data?.customers ?? [];
});

const handleExport = (format: "excel" | "pdf") => {
  const url = `${config.public.apiBase}/api/sales-orders/export/${format}`;
  window.open(url, "_blank");
};

const columnChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
let columnChartInstance: echarts.ECharts | null = null;
let pieChartInstance: echarts.ECharts | null = null;

const monthlyTotals = computed(() => {
  const map = new Map<string, number>();
  rows.value.forEach((row) => {
    map.set(row.month, (map.get(row.month) ?? 0) + row.total);
  });
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
});

const customerTotals = computed(() => {
  const map = new Map<string, number>();
  rows.value.forEach((row) => {
    map.set(row.customerName, (map.get(row.customerName) ?? 0) + row.total);
  });
  return [...map.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([name, total]) => ({ name, value: total }));
});

const updateColumnChart = () => {
  if (!columnChartInstance) return;

  const items = monthlyTotals.value;

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
      data: items.map((item) => item.month),
      axisLabel: { color: "#6b7280", fontSize: 11 },
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
        name: "Revenue",
        type: "bar",
        barMaxWidth: 40,
        itemStyle: { color: "#019932", borderRadius: [4, 4, 0, 0] },
        data: items.map((item) => item.total),
      },
    ],
  };

  columnChartInstance.setOption(option, true);
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
        name: "Revenue",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: { formatter: "{b}: {d}%" },
        data: customerTotals.value,
      },
    ],
  };

  pieChartInstance.setOption(option, true);
};

watch(monthlyTotals, () => updateColumnChart());
watch(customerTotals, () => updatePieChart());

const resizeHandler = () => {
  columnChartInstance?.resize();
  pieChartInstance?.resize();
};

onMounted(async () => {
  await nextTick();
  if (columnChartRef.value) {
    columnChartInstance = echarts.init(columnChartRef.value);
    updateColumnChart();
  }
  if (pieChartRef.value) {
    pieChartInstance = echarts.init(pieChartRef.value);
    updatePieChart();
  }
  window.addEventListener("resize", resizeHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeHandler);
  columnChartInstance?.dispose();
  pieChartInstance?.dispose();
  columnChartInstance = null;
  pieChartInstance = null;
});
</script>
