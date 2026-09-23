<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Reports / Sales Report">
        <template #extra> </template>
      </el-page-header>
    </template>

    <div class="flex flex-col gap-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <el-card shadow="never">
          <template #header>
            <div class="font-semibold text-gray-800 text-base">
              Revenue per Month
            </div>
          </template>
          <div ref="columnChartRef" class="h-96 w-full"></div>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <div class="font-semibold text-gray-800 text-base">
              Revenue by Customer
            </div>
          </template>
          <div ref="pieChartRef" class="h-96 w-full"></div>
        </el-card>
      </div>
    </div>
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
import { toRupiah } from "@/utils/number";

interface CustomerMonthlyRevenue {
  customerId: number;
  customerName: string;
  month: string;
  total: number;
}

definePageMeta({ layout: false });
const request = useRequest();

const { data } = useQuery<{ data: CustomerMonthlyRevenue[]; total: number }>({
  queryKey: ["sales-report"],
  queryFn: () => request("/api/report/customer-monthly-revenue"),
});

const rows = computed(() => data.value?.data ?? []);

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
