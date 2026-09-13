<template>
  <el-card
    class="rounded-xl border border-gray-100 shadow-sm h-full"
    shadow="hover"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
            <PieChart :size="18" />
          </div>
          <div>
            <div class="font-semibold text-gray-800 text-base">
              Order Status Breakdown
            </div>
            <div class="text-xs text-gray-500">
              Distribution of current period sales orders
            </div>
          </div>
        </div>

        <el-tag
          size="small"
          type="success"
          effect="plain"
          class="rounded-full font-medium"
        >
          {{ totalOrders }} Total Orders
        </el-tag>
      </div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      <!-- Chart Area -->
      <div class="md:col-span-6 relative">
        <div ref="chartRef" class="h-64 w-full"></div>
      </div>

      <!-- Breakdown Details List -->
      <div class="md:col-span-6 space-y-2.5">
        <div
          v-for="item in statusData"
          :key="item.name"
          class="p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between text-xs mb-1">
            <div class="flex items-center gap-2">
              <span
                class="w-2.5 h-2.5 rounded-full"
                :style="{ backgroundColor: item.color }"
              ></span>
              <span class="font-medium text-gray-700">{{ item.name }}</span>
            </div>
            <div class="flex items-center gap-1.5 font-semibold text-gray-800">
              <span>{{ item.value }}</span>
              <span class="text-gray-400 font-normal">
                ({{ calculatePercentage(item.value) }}%)
              </span>
            </div>
          </div>

          <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{
                width: `${calculatePercentage(item.value)}%`,
                backgroundColor: item.color,
              }"
            ></div>
          </div>

          <div class="text-[11px] text-gray-400 mt-1 flex justify-between">
            <span>Value:</span>
            <span class="font-medium text-gray-600">{{
              item.formattedAmount
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import * as echarts from "echarts";
import { PieChart } from "lucide-vue-next";
import { toRupiah } from "@/utils/number";

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const statusData = [
  {
    name: "Completed",
    value: 122,
    amount: "2680000000",
    formattedAmount: toRupiah("2680000000"),
    color: "#019932",
  },
  {
    name: "Processing / In Production",
    value: 36,
    amount: "765000000",
    formattedAmount: toRupiah("765000000"),
    color: "#3b82f6",
  },
  {
    name: "Ready for Delivery",
    value: 14,
    amount: "285000000",
    formattedAmount: toRupiah("285000000"),
    color: "#06b6d4",
  },
  {
    name: "Pending Approval",
    value: 8,
    amount: "95000000",
    formattedAmount: toRupiah("95000000"),
    color: "#f59e0b",
  },
  {
    name: "Cancelled",
    value: 4,
    amount: "20000000",
    formattedAmount: toRupiah("20000000"),
    color: "#ef4444",
  },
];

const totalOrders = computed(() =>
  statusData.reduce((acc, curr) => acc + curr.value, 0),
);

const calculatePercentage = (value: number) => {
  if (!totalOrders.value) return 0;
  return ((value / totalOrders.value) * 100).toFixed(1);
};

const updateChart = () => {
  if (!chartInstance) return;

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: {
        color: "#1f2937",
        fontSize: 12,
      },
      formatter: (params: any) => {
        const item = statusData.find((s) => s.name === params.name);
        return `
          <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
          <div>Count: <b>${params.value}</b> (${params.percent}%)</div>
          <div>Amount: <b>${item?.formattedAmount || 0}</b></div>
        `;
      },
    },
    legend: {
      show: false,
    },
    series: [
      {
        name: "Order Status",
        type: "pie",
        radius: ["55%", "80%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
            formatter: "{b}\n{c} orders",
          },
        },
        labelLine: {
          show: false,
        },
        data: statusData.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color },
        })),
      },
    ],
  };

  chartInstance.setOption(option);
};

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
