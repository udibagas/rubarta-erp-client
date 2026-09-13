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
              Sales Revenue vs Target
            </div>
            <div class="text-xs text-gray-500">
              Comparison of actual sales revenue against monthly targets
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <div class="hidden md:flex items-center gap-3 mr-2 text-xs">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
              <span class="text-gray-600">Actual Revenue</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span class="text-gray-600">Sales Target</span>
            </div>
          </div>

          <el-radio-group
            v-model="granularity"
            size="small"
            @change="handleGranularityChange"
          >
            <el-radio-button value="weekly">Weekly</el-radio-button>
            <el-radio-button value="monthly">Monthly</el-radio-button>
            <el-radio-button value="quarterly">Quarterly</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </template>

    <!-- Quick Revenue Stats Bar -->
    <div class="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg text-xs">
      <div>
        <div class="text-gray-500">Period Total</div>
        <div class="text-sm sm:text-base font-bold text-gray-800">
          {{ formatSummaryRevenue }}
        </div>
      </div>
      <div>
        <div class="text-gray-500">Target Target</div>
        <div class="text-sm sm:text-base font-bold text-gray-800">
          {{ formatSummaryTarget }}
        </div>
      </div>
      <div>
        <div class="text-gray-500">Attainment Rate</div>
        <div class="text-sm sm:text-base font-bold text-emerald-600">
          {{ attainmentRate }}%
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div ref="chartRef" class="h-80 w-full"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import * as echarts from "echarts";
import { LineChart } from "lucide-vue-next";
import { toRupiah } from "@/utils/number";

const granularity = ref<"weekly" | "monthly" | "quarterly">("monthly");
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// Dummy chart data datasets
const datasets = {
  monthly: {
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    actual: [
      265000000, 310000000, 290000000, 375000000, 340000000, 420000000,
      390000000, 450000000, 485000000, 510000000, 470000000, 535000000,
    ],
    target: [
      280000000, 280000000, 300000000, 350000000, 350000000, 400000000,
      400000000, 420000000, 450000000, 480000000, 480000000, 500000000,
    ],
  },
  weekly: {
    categories: [
      "W1 (1-7)",
      "W2 (8-14)",
      "W3 (15-21)",
      "W4 (22-28)",
      "W5 (29-31)",
    ],
    actual: [112000000, 134000000, 98000000, 156000000, 85000000],
    target: [100000000, 120000000, 110000000, 130000000, 80000000],
  },
  quarterly: {
    categories: ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026 (Est.)"],
    actual: [865000000, 1135000000, 1325000000, 1515000000],
    target: [880000000, 1100000000, 1270000000, 1460000000],
  },
};

const currentData = computed(() => datasets[granularity.value]);

const formatSummaryRevenue = computed(() => {
  const sum = currentData.value.actual.reduce((a, b) => a + b, 0);
  return toRupiah(String(sum));
});

const formatSummaryTarget = computed(() => {
  const sum = currentData.value.target.reduce((a, b) => a + b, 0);
  return toRupiah(String(sum));
});

const attainmentRate = computed(() => {
  const actualSum = currentData.value.actual.reduce((a, b) => a + b, 0);
  const targetSum = currentData.value.target.reduce((a, b) => a + b, 0);
  if (!targetSum) return "0.0";
  return ((actualSum / targetSum) * 100).toFixed(1);
});

const updateChart = () => {
  if (!chartInstance) return;

  const data = currentData.value;

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
        type: "cross",
        crossStyle: {
          color: "#999",
        },
      },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return "";
        let result = `<div style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">${params[0].name}</div>`;
        params.forEach((item: any) => {
          const valFormatted = toRupiah(String(item.value));
          result += `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 4px; font-size: 12px;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${item.color}; display: inline-block;"></span>
                <span>${item.seriesName}</span>
              </span>
              <span style="font-weight: 600; font-family: monospace;">${valFormatted}</span>
            </div>
          `;
        });
        return result;
      },
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "3%",
      top: "12%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: data.categories,
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
        name: "Actual Revenue",
        type: "bar",
        barMaxWidth: 32,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#019932" },
            { offset: 1, color: "#34d399" },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
        data: data.actual,
      },
      {
        name: "Sales Target",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: {
          color: "#f59e0b",
          width: 3,
        },
        itemStyle: {
          color: "#f59e0b",
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        data: data.target,
      },
    ],
  };

  chartInstance.setOption(option, true);
};

const handleGranularityChange = () => {
  updateChart();
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
