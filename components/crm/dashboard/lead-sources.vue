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
import * as echarts from "echarts";
import { Filter } from "lucide-vue-next";
const { useQuery } = await import("@tanstack/vue-query");
const request = useRequest();

const { data } = useQuery({
  queryKey: ["lead-sources"],
  queryFn: () => request("/api/crm-dashboard/leads/source-breakdown"),
  keepPreviousData: true,
  refetchOnWindowFocus: false,
});

const leadSourceChart = ref(null);
let leadSourceChartInstance = null;

const updateLeadSourceChart = () => {
  if (!leadSourceChartInstance || !data.value) return;

  // Sort by count descending
  const sortedData = [...data.value].sort((a, b) => b.count - a.count);

  // Format source names (convert camelCase to readable)
  const formatSourceName = (source) => {
    return source
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Get color based on conversion rate
  const getColorByConversion = (rate) => {
    if (rate >= 80) return "#019932";
    if (rate >= 60) return "#67C23A";
    if (rate >= 40) return "#409EFF";
    if (rate >= 20) return "#E6A23C";
    return "#F56C6C";
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
          <div style="font-weight: bold; margin-bottom: 8px;">${formatSourceName(dataItem.source)}</div>
          <div style="margin-bottom: 4px;">Total Leads: <b>${dataItem.count}</b></div>
          <div>Conversion Rate: <b>${dataItem.conversionRate.toFixed(1)}%</b></div>
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
      minInterval: 1,
    },
    yAxis: {
      type: "category",
      data: sortedData.map((item) => formatSourceName(item.source)),
    },
    series: [
      {
        name: "Leads",
        type: "bar",
        data: sortedData.map((item) => ({
          value: item.count,
          itemStyle: { color: getColorByConversion(item.conversionRate) },
        })),
        barWidth: "50%",
        label: {
          show: true,
          position: "right",
          formatter: (params) => {
            const dataItem = sortedData[params.dataIndex];
            return `${dataItem.conversionRate.toFixed(0)}%`;
          },
          color: "#666",
          fontSize: 11,
        },
      },
    ],
  };

  leadSourceChartInstance.setOption(option);
};

const initChart = async () => {
  await nextTick();
  leadSourceChartInstance = echarts.init(leadSourceChart.value);
  updateLeadSourceChart();

  window.addEventListener("resize", () => {
    leadSourceChartInstance?.resize();
  });
};

watch(data, () => {
  if (data.value) {
    updateLeadSourceChart();
  }
});

onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  leadSourceChartInstance?.dispose();
  window.removeEventListener("resize", () => {
    leadSourceChartInstance?.resize();
  });
});
</script>
