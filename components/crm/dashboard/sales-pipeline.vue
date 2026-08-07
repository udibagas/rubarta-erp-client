<template>
  <el-card class="rounded-xl h-full" shadow="hover">
    <template #header>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 font-semibold">
          <PieChart :size="18" class="text-green-600" />
          <span>Conversion Funnel</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span>Overall Conversion: </span>
          <span class="font-bold text-green-600">
            {{ data?.overallConversionRate?.toFixed(1) ?? 0 }}%
          </span>
        </div>
      </div>
    </template>
    <div ref="pipelineChart" class="h-80 w-full"></div>
  </el-card>
</template>

<script setup>
import * as echarts from "echarts";
import { PieChart } from "lucide-vue-next";
import { useQuery } from "@tanstack/vue-query";
const request = useRequest();

const pipelineChart = ref(null);

const { data } = useQuery({
  queryKey: ["conversion-funnel"],
  queryFn: () => request("/api/crm-dashboard/conversion-funnel"),
  refetchOnWindowFocus: false,
});

let pipelineChartInstance = null;

const updatePipelineChart = () => {
  if (!pipelineChartInstance || !data.value) return;

  const funnelData = [
    {
      value: data.value.totalLeads,
      name: "Total Leads",
    },
    {
      value: data.value.qualifiedLeads,
      name: "Qualified Leads",
    },
    {
      value: data.value.totalOpportunities,
      name: "Opportunities",
    },
    {
      value: data.value.proposalSent,
      name: "Proposals Sent",
    },
    {
      value: data.value.wonOpportunities,
      name: "Won Opportunities",
    },
    {
      value: data.value.totalOrders,
      name: "Total Orders",
    },
    {
      value: data.value.completedOrders,
      name: "Completed Orders",
    },
  ];

  const colors = [
    "#019932",
    "#4CAF50",
    "#409EFF",
    "#66B1FF",
    "#E6A23C",
    "#F56C6C",
    "#F78989",
  ];

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params) => {
        const item = params[0];
        const total = data.value.totalLeads;
        const percentage = ((item.value / total) * 100).toFixed(1);
        return `
          <div style="font-weight: bold; margin-bottom: 4px;">${item.name}</div>
          <div>Count: <b>${item.value}</b></div>
          <div>Percentage: <b>${percentage}%</b></div>
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
      type: "category",
      data: funnelData.map((item) => item.name),
      axisLabel: {
        rotate: 45,
        fontSize: 11,
      },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
    },
    series: [
      {
        type: "bar",
        data: funnelData.map((item, index) => ({
          value: item.value,
          itemStyle: { color: colors[index] },
        })),
        barWidth: "60%",
        label: {
          show: true,
          position: "top",
          formatter: "{c}",
          fontSize: 11,
          color: "#666",
        },
      },
    ],
  };

  pipelineChartInstance.setOption(option);
};

const initChart = async () => {
  await nextTick();
  pipelineChartInstance = echarts.init(pipelineChart.value);
  updatePipelineChart();
  window.addEventListener("resize", () => {
    pipelineChartInstance?.resize();
  });
};

watch(data, () => {
  if (data.value) {
    updatePipelineChart();
  }
});

onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  pipelineChartInstance?.dispose();
  window.removeEventListener("resize", () => {});
});
</script>
