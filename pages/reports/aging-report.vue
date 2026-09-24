<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Aging Report">
        <template #extra>
          <div class="flex gap-2">
            <el-button @click="refetch()" :icon="ElIconRefresh" />

            <el-dropdown split-button @command="handleExport">
              <el-icon class="mr-1"><ElIconDownload /></el-icon>
              Export
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="excel" :icon="ElIconMemo">
                    Excel
                  </el-dropdown-item>
                  <el-dropdown-item command="pdf" :icon="ElIconDocument">
                    PDF
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-select
              v-model="customerId"
              placeholder="Customer"
              filterable
              clearable
              class="w-52!"
              @change="refetch()"
            >
              <el-option
                v-for="customer in customers"
                :key="customer.id"
                :value="customer.id"
                :label="customer.name"
              />
              <template #prefix>
                <el-icon><ElIconOfficeBuilding /></el-icon>
              </template>
            </el-select>
          </div>
        </template>
      </el-page-header>
    </template>

    <div class="flex gap-2">
      <div class="flex flex-col gap-2 w-80">
        <el-card shadow="never">
          <div class="text-xs text-gray-400 uppercase mb-1">As of Date</div>
          <div class="text-lg font-semibold text-gray-800">
            {{ formatDate(data?.asOfDate) }}
          </div>
        </el-card>

        <el-card shadow="never">
          <div class="text-xs text-gray-400 uppercase mb-1">
            Total Outstanding
          </div>
          <div
            :class="[
              'text-lg',
              'font-semibold',
              'text-gray-800',
              data?.totalOutstanding > 0 ? 'text-red-500' : 'text-green-500',
            ]"
          >
            {{ toCurrency(data?.totalOutstanding ?? 0) }}
          </div>
        </el-card>

        <el-card shadow="never">
          <div class="text-xs text-gray-400 uppercase mb-1">Total Invoices</div>
          <div class="text-lg font-semibold text-gray-800">
            {{ data?.totalInvoices ?? 0 }}
          </div>
        </el-card>
      </div>

      <div class="flex-1">
        <el-card
          shadow="never"
          class="mb-4"
          header="Outstanding by Aging Bucket"
        >
          <div ref="chartRef" class="h-46 w-full"></div>
        </el-card>
      </div>
    </div>

    <el-table
      stripe
      v-loading="isPending"
      :data="invoices"
      :summary-method="getSummaries"
      show-summary
    >
      <template #empty>
        <el-empty description="No Items"> </el-empty>
      </template>

      <el-table-column label="Number" prop="number" width="150" fixed="left">
        <template #default="{ row }">
          <el-link
            class="font-mono font-semibold!"
            @click="navigateTo(`/sales/invoices/${row.id}`)"
            type="success"
          >
            {{ row.number }}
          </el-link>
        </template>
      </el-table-column>

      <el-table-column label="Customer" min-width="200">
        <template #default="{ row }">
          <div class="line-clamp-1">
            {{ row.customerName || "-" }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Due Date" width="120">
        <template #default="{ row }">
          {{ formatDate(row.dueDate) }}
        </template>
      </el-table-column>

      <el-table-column
        label="Overdue"
        width="130"
        align="center"
        header-align="center"
      >
        <template #default="{ row }">
          {{ row.daysOverdue }} day{{ row.daysOverdue === 1 ? "" : "s" }}
        </template>
      </el-table-column>

      <el-table-column
        label="Outstanding"
        prop="outstanding"
        min-width="150"
        align="right"
        header-align="center"
      >
        <template #default="{ row }">
          {{ toCurrency(row.outstanding) }}
        </template>
      </el-table-column>

      <el-table-column
        label="Aging Bucket"
        align="center"
        header-align="center"
      >
        <el-table-column
          label="Current"
          prop="outstanding"
          header-align="center"
          align="right"
          min-width="150"
        >
          <template #default="{ row }">
            {{ row.bucket === "current" ? toCurrency(row.outstanding) : "-" }}
          </template>
        </el-table-column>

        <el-table-column
          label="1 - 30 Days"
          prop="outstanding"
          header-align="center"
          align="right"
          min-width="150"
        >
          <template #default="{ row }">
            {{ row.bucket === "1-30" ? toCurrency(row.outstanding) : "-" }}
          </template>
        </el-table-column>

        <el-table-column
          label="31 - 60 Days"
          prop="outstanding"
          header-align="center"
          align="right"
          min-width="150"
        >
          <template #default="{ row }">
            {{ row.bucket === "31-60" ? toCurrency(row.outstanding) : "-" }}
          </template>
        </el-table-column>

        <el-table-column
          label="61 - 90 Days"
          prop="outstanding"
          header-align="center"
          align="right"
          min-width="150"
        >
          <template #default="{ row }">
            {{ row.bucket === "61-90" ? toCurrency(row.outstanding) : "-" }}
          </template>
        </el-table-column>

        <el-table-column
          label="90+ Days"
          prop="outstanding"
          header-align="center"
          align="right"
          min-width="150"
        >
          <template #default="{ row }">
            {{ row.bucket === "90+" ? toCurrency(row.outstanding) : "-" }}
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </nuxt-layout>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { gql } from "@apollo/client";
import { useQuery } from "@tanstack/vue-query";
import * as echarts from "echarts";

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const request = useRequest();
const customers = ref([]);
const customerId = ref(null);

const { data, isPending, refetch } = useQuery({
  queryKey: ["aging-report"],
  queryFn: () =>
    request("/api/report/aging-report", {
      params: { customerId: customerId.value },
    }),
});

useGraphqlQuery(gql`
  query {
    customers {
      id
      name
    }
  }
`).then((result) => {
  customers.value = result.data.customers;
});

const buckets = computed(() => data.value?.buckets ?? []);

// Flatten invoices from all buckets into a single table dataset
const invoices = computed(() =>
  buckets.value.flatMap((bucket) =>
    bucket.invoices.map((invoice) => ({
      ...invoice,
      bucket: bucket.bucket,
      bucketLabel: bucket.label,
    })),
  ),
);

const handleExport = (format) => {
  const url = `${config.public.apiBase}/api/invoices/export/${format}`;
  window.open(url, "_blank");
};

const bucketKeys = ["current", "1-30", "31-60", "61-90", "90+"];

const getSummaries = ({ columns }) => {
  const sums = [];

  columns.forEach((column, index) => {
    // Index 0-3 = Number, Customer, Due Date, Days Overdue
    if (index < 4) {
      sums[index] = index === 1 ? "TOTAL" : "";
      return;
    }

    // Index 4 = Outstanding, Index 5-9 = bucket columns
    if (index === 4) {
      sums[index] = toCurrency(data.value?.totalOutstanding ?? 0);
      return;
    }

    const bucketKey = bucketKeys[index - 5];
    const bucket = buckets.value.find((b) => b.bucket === bucketKey);
    sums[index] = toCurrency(bucket?.total ?? 0);
  });

  return sums;
};

const chartRef = ref(null);
let chartInstance = null;

const bucketColors = {
  current: "#019932",
  "1-30": "#84cc16",
  "31-60": "#f59e0b",
  "61-90": "#f97316",
  "90+": "#ef4444",
};

const updateChart = () => {
  if (!chartInstance) return;

  const items = buckets.value;

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        if (!Array.isArray(params) || params.length === 0) return "";
        const item = params[0];
        const bucket = items[item.dataIndex];
        return `${item.name}<br/>${toCurrency(item.value)} (${bucket?.invoiceCount ?? 0} invoices)`;
      },
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "3%",
      top: "8%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: items.map((item) => item.label),
      axisLabel: { color: "#6b7280", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#9ca3af",
        fontSize: 11,
        formatter: (val) =>
          val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : `${val}`,
      },
      splitLine: { lineStyle: { color: "#f3f4f6", type: "dashed" } },
    },
    series: [
      {
        name: "Outstanding",
        type: "bar",
        barMaxWidth: 60,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (params) =>
            bucketColors[items[params.dataIndex]?.bucket] ?? "#019932",
        },
        data: items.map((item) => item.total),
      },
    ],
  };

  chartInstance.setOption(option, true);
};

watch(buckets, () => updateChart());

const resizeHandler = () => {
  chartInstance?.resize();
};

onMounted(async () => {
  await nextTick();
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    updateChart();
  }
  window.addEventListener("resize", resizeHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeHandler);
  chartInstance?.dispose();
  chartInstance = null;
});
</script>
