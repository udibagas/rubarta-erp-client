<template>
  <el-card
    class="rounded-xl border border-gray-100 shadow-sm h-full"
    shadow="hover"
  >
    <template #header>
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2">
          <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <LineChart :size="18" />
          </div>
          <div>
            <div class="font-semibold text-gray-800 text-base">
              Sales Orders Revenue Trend
            </div>
            <div class="text-xs text-gray-500">
              Monthly revenue and order volume for the last 12 months
            </div>
          </div>
        </div>

        <el-radio-group v-model="metric" size="small">
          <el-radio-button value="revenue">Revenue</el-radio-button>
          <el-radio-button value="orderCount">Orders</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <!-- Quick Stats Bar -->
    <div class="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg text-xs">
      <div>
        <div class="text-gray-500">Total Revenue</div>
        <div class="text-sm sm:text-base font-bold text-gray-800">
          {{ formattedTotalRevenue }}
        </div>
      </div>
      <div>
        <div class="text-gray-500">Total Orders</div>
        <div class="text-sm sm:text-base font-bold text-gray-800">
          {{ totalOrders }}
        </div>
      </div>
      <div>
        <div class="text-gray-500">This Month</div>
        <div class="text-sm sm:text-base font-bold text-emerald-600">
          {{ formattedLatestRevenue }}
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div ref="chartRef" class="h-80 w-full"></div>
  </el-card>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
  watch,
} from "vue";
import * as echarts from "echarts";
import { LineChart } from "lucide-vue-next";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/vue-query";
import { toRupiah } from "@/utils/number";

interface RevenueTrendItem {
  month: string;
  year: number;
  revenue: number;
  orderCount: number;
}

const request = useRequest();

const { data: salesData } = useQuery<RevenueTrendItem[]>({
  queryKey: ["sales-revenue-trend"],
  queryFn: async () => {
    return request("/api/sales-dashboard/revenue-trend");
  },
});

const metric = ref<"revenue" | "orderCount">("revenue");
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const trend = computed(() => salesData.value ?? []);

const totalRevenue = computed(() =>
  trend.value.reduce((sum, item) => sum + item.revenue, 0),
);

const totalOrders = computed(() =>
  trend.value.reduce((sum, item) => sum + item.orderCount, 0),
);

const formattedTotalRevenue = computed(() =>
  toRupiah(String(totalRevenue.value)),
);

const formattedLatestRevenue = computed(() =>
  toRupiah(String(trend.value[trend.value.length - 1]?.revenue ?? 0)),
);

const updateChart = () => {
  if (!chartInstance) return;

  const data = trend.value;
  const isRevenue = metric.value === "revenue";

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: {
        color: "#1f2937",
      },
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return "";
        const item = params[0];
        const value = isRevenue
          ? toRupiah(String(item.value))
          : `${item.value} Orders`;
        return `
          <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
          <div>${value}</div>
        `;
      },
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "3%",
      top: "8%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: data.map((item) => dayjs(`${item.month}-01`).format("MMM YYYY")),
        axisLine: {
          lineStyle: {
            color: "#e5e7eb",
          },
        },
        axisLabel: {
          color: "#6b7280",
          fontSize: 11,
        },
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        splitLine: {
          lineStyle: {
            color: "#f3f4f6",
            type: "dashed",
          },
        },
        axisLabel: {
          color: "#9ca3af",
          fontSize: 11,
          formatter: (val: number) => {
            if (!isRevenue) return `${val}`;
            if (val >= 1000000000) {
              return `Rp ${(val / 1000000000).toFixed(1)}B`;
            }
            if (val >= 1000000) {
              return `Rp ${(val / 1000000).toFixed(0)}M`;
            }
            return `Rp ${val}`;
          },
        },
      },
    ],
    series: [
      {
        name: isRevenue ? "Revenue" : "Orders",
        type: "bar",
        barMaxWidth: 32,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#019932" },
            { offset: 1, color: "#34d399" },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
        data: data.map((item) => (isRevenue ? item.revenue : item.orderCount)),
      },
    ],
  };

  chartInstance.setOption(option, true);
};

watch([trend, metric], () => updateChart());

const resizeHandler = () => {
  chartInstance?.resize();
};

onMounted(async () => {
  await nextTick();
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    updateChart();
    window.addEventListener("resize", resizeHandler);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeHandler);
  chartInstance?.dispose();
  chartInstance = null;
});
</script>
