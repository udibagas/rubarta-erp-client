<template>
  <el-table stripe v-loading="isPending" :data="data">
    <template #empty>
      <el-empty description="No Items"> </el-empty>
    </template>
    <el-table-column
      label="Invoice #"
      prop="number"
      min-width="150"
      fixed="left"
    >
      <template #default="{ row }">
        <el-link
          class="font-mono font-semibold!"
          @click="navigateTo(`/sales/invoices/${row.id}`)"
          type="success"
        >
          {{ row.number }}
        </el-link>
        <div class="text-xs text-gray-400">
          {{ formatDate(row.date) }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Reference Number" min-width="200">
      <template #default="{ row }">
        <div class="font-semibold">
          {{ row.referenceNumber }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="SO / DO">
      <template #default="{ row }">
        <div>
          {{ row.SalesOrder?.number || "-" }}
        </div>
        <div>
          {{ row.DeliveryOrder?.number }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Due Date" width="120">
      <template #default="{ row }">
        <div>
          {{ formatDate(row.dueDate) }}
        </div>
        <div class="text-xs text-gray-400">
          {{ dayjs(row.dueDate).fromNow() }}
        </div>
      </template>
    </el-table-column>

    <el-table-column
      label="Grand Total"
      min-width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <div class="font-mono font-semibold">
          {{ toCurrency(row.grandTotal, row.currency) }}
        </div>
        <span class="text-xs text-gray-400">
          {{ toDecimal(row._count.InvoiceItems) }} parts
        </span>
      </template>
    </el-table-column>

    <el-table-column
      label="Status"
      prop="status"
      width="120"
      align="center"
      header-align="center"
      fixed="right"
    >
      <template #default="{ row }">
        <StatusTag :status="row.status" effect="light" style="width: 100%" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const { customerId } = defineProps({
  customerId: {
    type: Number,
    required: true,
  },
});

const request = useRequest();

const { data = [], isPending } = useQuery({
  queryKey: ["invoices", customerId],
  queryFn: () => request("/api/invoices", { params: { customerId } }),
});
</script>
