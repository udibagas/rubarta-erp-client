<template>
  <el-card class="rounded-xl h-full" shadow="hover">
    <template #header>
      <div class="flex items-center gap-2 font-semibold">
        <Filter :size="16" class="text-green-600" />
        <span>Lead Sources</span>
      </div>
    </template>
    <div ref="leadSourceChart" class="h-70 w-full"></div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
import { Filter } from "lucide-vue-next";

// Reactive data
const loading = ref(false);
const dateRange = ref([]);

// Chart refs
const leadSourceChart = ref(null);

// Chart instances
let leadSourceChartInstance = null;

const updateLeadSourceChart = () => {
  if (!leadSourceChartInstance) return;

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    series: [
      {
        type: "pie",
        radius: "70%",
        data: [
          { value: 45, name: "Website", itemStyle: { color: "#019932" } },
          { value: 30, name: "Social Media", itemStyle: { color: "#409EFF" } },
          { value: 25, name: "Referrals", itemStyle: { color: "#E6A23C" } },
          {
            value: 20,
            name: "Email Campaign",
            itemStyle: { color: "#67C23A" },
          },
          { value: 15, name: "Events", itemStyle: { color: "#F56C6C" } },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  leadSourceChartInstance.setOption(option);
};

const initCharts = async () => {
  await nextTick();

  // Initialize all charts
  leadSourceChartInstance = echarts.init(leadSourceChart.value);

  // Update all charts
  updateLeadSourceChart();

  // Handle window resize
  window.addEventListener("resize", () => {
    leadSourceChartInstance?.resize();
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
  leadSourceChartInstance?.dispose();

  // Remove resize listener
  window.removeEventListener("resize", () => {});
});
</script>
