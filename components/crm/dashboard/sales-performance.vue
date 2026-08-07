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
import { useQuery } from "@tanstack/vue-query";
import * as echarts from "echarts";
import { Target } from "lucide-vue-next";
const request = useRequest();

// Reactive data
const dateRange = ref([]);

const { data } = useQuery({
  queryKey: ["sales-performance", dateRange],
  queryFn: () =>
    request(
      `/api/crm-dashboard/sales-performance?startDate=${dateRange.value[0]}&endDate=${dateRange.value[1]}`,
    ),
  refetchOnWindowFocus: false,
});

// Chart refs
const salesPerformanceChart = ref(null);

// Chart instances
let salesPerformanceChartInstance = null;

const updateSalesPerformanceChart = () => {
  if (!salesPerformanceChartInstance || !data.value) return;

  // Sort by total revenue descending
  const sortedData = [...data.value].sort(
    (a, b) => b.totalRevenue - a.totalRevenue,
  );

  // Get color based on index
  const getColor = (index) => {
    const colors = ["#019932", "#409EFF", "#67C23A", "#E6A23C", "#F56C6C"];
    return colors[index % colors.length];
  };

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params) => {
        const item = params[0];
        const dataItem = sortedData[item.dataIndex];
        return `
          <div style="font-weight: bold; margin-bottom: 8px;">${dataItem.userName}</div>
          <div style="margin-bottom: 4px;">Total Revenue: <b>${toCurrency(dataItem.totalRevenue)}</b></div>
          <div style="margin-bottom: 4px;">Leads: ${dataItem.totalLeads} (Converted: ${dataItem.convertedLeads})</div>
          <div style="margin-bottom: 4px;">Opportunities: ${dataItem.totalOpportunities} (Won: ${dataItem.wonOpportunities})</div>
          <div>Quotations: ${dataItem.totalQuotations} (Accepted: ${dataItem.acceptedQuotations})</div>
        `;
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
      axisLabel: {
        formatter: (value) => {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + "M";
          } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + "K";
          }
          return value;
        },
      },
    },
    yAxis: {
      type: "category",
      data: sortedData.map((item) => item.userName),
    },
    series: [
      {
        type: "bar",
        data: sortedData.map((item, index) => ({
          value: item.totalRevenue,
          itemStyle: { color: getColor(index) },
        })),
        barWidth: "60%",
      },
    ],
  };

  salesPerformanceChartInstance.setOption(option);
};

const initChart = async () => {
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

// Watch for data changes
watch(data, () => {
  if (data.value) {
    updateSalesPerformanceChart();
  }
});

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

  initChart();
});

onBeforeUnmount(() => {
  // Dispose charts
  salesPerformanceChartInstance?.dispose();

  // Remove resize listener
  window.removeEventListener("resize", () => {});
});
</script>
