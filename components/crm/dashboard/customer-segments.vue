<template>
  <el-card class="rounded-xl h-full" shadow="hover">
    <template #header>
      <div class="flex items-center gap-2 font-semibold">
        <Users :size="16" class="text-green-600" />
        <span>Customer Segments</span>
      </div>
    </template>
    <div ref="customerSegmentChart" class="h-70 w-full"></div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
import { Users } from "lucide-vue-next";

// Reactive data
const loading = ref(false);
const dateRange = ref([]);

// Chart refs
const customerSegmentChart = ref(null);

// Chart instances
let customerSegmentChartInstance = null;

const updateCustomerSegmentChart = () => {
  if (!customerSegmentChartInstance) return;

  const option = {
    tooltip: {
      trigger: "item",
    },
    series: [
      {
        type: "pie",
        radius: "70%",
        data: [
          { value: 40, name: "Enterprise", itemStyle: { color: "#019932" } },
          { value: 35, name: "Mid-Market", itemStyle: { color: "#409EFF" } },
          { value: 25, name: "SMB", itemStyle: { color: "#E6A23C" } },
        ],
        label: {
          show: true,
          position: "outside",
          formatter: "{b}: {d}%",
        },
      },
    ],
  };

  customerSegmentChartInstance.setOption(option);
};

const initCharts = async () => {
  await nextTick();

  // Initialize all charts
  customerSegmentChartInstance = echarts.init(customerSegmentChart.value);

  // Update all charts
  updateCustomerSegmentChart();

  // Handle window resize
  window.addEventListener("resize", () => {
    customerSegmentChartInstance?.resize();
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
  customerSegmentChartInstance?.dispose();

  // Remove resize listener
  window.removeEventListener("resize", () => {});
});
</script>
