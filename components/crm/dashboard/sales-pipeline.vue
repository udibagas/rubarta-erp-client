<template>
  <el-card class="rounded-xl h-full" shadow="hover">
    <template #header>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 font-semibold">
          <PieChart :size="18" class="text-green-600" />
          <span>Sales Pipeline</span>
        </div>
        <el-dropdown @command="handlePipelineFilter">
          <el-button text size="small">
            {{ pipelineFilter }}
            <ChevronDown :size="14" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="This Month"
                >This Month</el-dropdown-item
              >
              <el-dropdown-item command="Last 3 Months"
                >Last 3 Months</el-dropdown-item
              >
              <el-dropdown-item command="This Year">This Year</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
    <div ref="pipelineChart" class="h-80 w-full"></div>
  </el-card>
</template>

<script setup>
import * as echarts from "echarts";
import { PieChart, ChevronDown } from "lucide-vue-next";

const pipelineFilter = ref("This Month");
const pipelineChart = ref(null);
const dateRange = ref([]);

let pipelineChartInstance = null;

const handlePipelineFilter = (command) => {
  pipelineFilter.value = command;
  updatePipelineChart();
};

const updatePipelineChart = () => {
  if (!pipelineChartInstance) return;

  const option = {
    title: {
      show: false,
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: ${c} ({d}%)",
    },
    legend: {
      bottom: "0%",
      left: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 335000, name: "Qualified", itemStyle: { color: "#019932" } },
          { value: 210000, name: "Proposal", itemStyle: { color: "#409EFF" } },
          {
            value: 180000,
            name: "Negotiation",
            itemStyle: { color: "#E6A23C" },
          },
          { value: 95000, name: "Closed Won", itemStyle: { color: "#67C23A" } },
          {
            value: 45000,
            name: "Closed Lost",
            itemStyle: { color: "#F56C6C" },
          },
        ],
      },
    ],
  };

  pipelineChartInstance.setOption(option);
};

const initCharts = async () => {
  await nextTick();

  // Initialize chart
  pipelineChartInstance = echarts.init(pipelineChart.value);

  // Update chart
  updatePipelineChart();

  // Handle window resize
  window.addEventListener("resize", () => {
    pipelineChartInstance?.resize();
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
  pipelineChartInstance?.dispose();

  // Remove resize listener
  window.removeEventListener("resize", () => {});
});
</script>
