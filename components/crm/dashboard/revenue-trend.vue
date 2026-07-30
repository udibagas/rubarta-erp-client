<template>
  <el-card class="rounded-xl h-full" shadow="hover">
    <template #header>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 font-semibold">
          <LineChart :size="18" class="text-green-600" />
          <span>Revenue Trend</span>
        </div>
        <el-button-group size="small">
          <el-button
            :type="revenueFilter === 'monthly' ? 'primary' : 'default'"
            @click="
              revenueFilter = 'monthly';
              updateRevenueChart();
            "
          >
            Monthly
          </el-button>
          <el-button
            :type="revenueFilter === 'quarterly' ? 'primary' : 'default'"
            @click="
              revenueFilter = 'quarterly';
              updateRevenueChart();
            "
          >
            Quarterly
          </el-button>
        </el-button-group>
      </div>
    </template>
    <div ref="revenueChart" class="h-80 w-full"></div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
import { LineChart } from "lucide-vue-next";

// Reactive data
const dateRange = ref([]);
const revenueFilter = ref("monthly");

// Chart refs
const revenueChart = ref(null);

let revenueChartInstance = null;

const updateRevenueChart = () => {
  if (!revenueChartInstance) return;

  const monthlyData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const revenueData = [120000, 145000, 135000, 180000, 165000, 195000];
  const targetData = [150000, 150000, 150000, 170000, 170000, 170000];

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    legend: {
      data: ["Revenue", "Target"],
      top: "5%",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: monthlyData,
      },
    ],
    yAxis: [
      {
        type: "value",
        axisLabel: {
          formatter: "${value}",
        },
      },
    ],
    series: [
      {
        name: "Revenue",
        type: "line",
        smooth: true,
        itemStyle: {
          color: "#019932",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(1, 153, 50, 0.3)" },
              { offset: 1, color: "rgba(1, 153, 50, 0.05)" },
            ],
          },
        },
        data: revenueData,
      },
      {
        name: "Target",
        type: "line",
        smooth: true,
        lineStyle: {
          type: "dashed",
        },
        itemStyle: {
          color: "#409EFF",
        },
        data: targetData,
      },
    ],
  };

  revenueChartInstance.setOption(option);
};

const initCharts = async () => {
  await nextTick();
  // Initialize chart
  revenueChartInstance = echarts.init(revenueChart.value);
  // Update chart
  updateRevenueChart();

  // Handle window resize
  window.addEventListener("resize", () => {
    revenueChartInstance?.resize();
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
  revenueChartInstance?.dispose();
  // Remove resize listener
  window.removeEventListener("resize", () => {});
});
</script>
