<template>
  <el-card class="rounded-xl h-full" shadow="hover">
    <template #header>
      <div class="flex items-center gap-2 font-semibold">
        <Target :size="16" class="text-green-600" />
        <span>Sales Team Performance</span>
      </div>
    </template>
    <div ref="salesPerformanceChart" class="h-70 w-full"></div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
import { Target } from "lucide-vue-next";

// Reactive data
const loading = ref(false);
const dateRange = ref([]);

// Chart refs
const salesPerformanceChart = ref(null);

// Chart instances
let salesPerformanceChartInstance = null;

const updateSalesPerformanceChart = () => {
  if (!salesPerformanceChartInstance) return;

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
    },
    yAxis: {
      type: "category",
      data: ["John S.", "Sarah J.", "Mike W.", "Lisa D.", "Tom B."],
    },
    series: [
      {
        type: "bar",
        data: [
          { value: 95, itemStyle: { color: "#019932" } },
          { value: 88, itemStyle: { color: "#409EFF" } },
          { value: 82, itemStyle: { color: "#67C23A" } },
          { value: 76, itemStyle: { color: "#E6A23C" } },
          { value: 69, itemStyle: { color: "#F56C6C" } },
        ],
        barWidth: "60%",
      },
    ],
  };

  salesPerformanceChartInstance.setOption(option);
};

const initCharts = async () => {
  await nextTick();

  // Initialize all charts
  salesPerformanceChartInstance = echarts.init(salesPerformanceChart.value);

  // Update all charts
  updateSalesPerformanceChart();

  // Handle window resize
  window.addEventListener("resize", () => {
    salesPerformanceChartInstance?.resize();
  });
};

// Lifecycle
onMounted(() => {
  // Set default date range (last 30 days)
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  dateRange.value = [
    start.toISOString().split("T")[0],
    end.toISOString().split("T")[0],
  ];

  initCharts();
});

onBeforeUnmount(() => {
  // Dispose charts
  salesPerformanceChartInstance?.dispose();

  // Remove resize listener
  window.removeEventListener("resize", () => {});
});
</script>
