<template>
  <el-table stripe v-loading="isPending" :data="data">
    <template #empty>
      <el-empty description="No Items"> </el-empty>
    </template>
    <el-table-column
      label="Order No."
      prop="number"
      min-width="150"
      fixed="left"
    >
      <template #default="{ row }">
        <el-link
          class="font-mono font-semibold!"
          @click="navigateTo(`/sales/orders/${row.id}`)"
          type="success"
        >
          {{ row.number }}
        </el-link>
        <div class="text-xs text-gray-400">
          {{ formatDate(row.createdAt) }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Contact Person" min-width="180">
      <template #default="{ row }">
        <div class="font-semibold line-clamp-1">
          {{ row.contactPerson }}
        </div>
        <div class="text-xs text-gray-400 line-clamp-1">
          {{ row.contactEmail }}
        </div>
        <div class="text-xs text-gray-400 line-clamp-1">
          {{ row.contactPhone }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Created By" min-width="200">
      <template #default="{ row }">
        <div class="flex items-center gap-2">
          <el-avatar
            :size="24"
            :style="{ backgroundColor: getAvatarColor(row.User?.name || '') }"
            class="shrink-0"
          >
            {{ row.User?.name?.charAt(0).toUpperCase() }}
          </el-avatar>
          <div class="line-clamp-1 font-semibold">
            {{ row.User?.name || "-" }}
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column
      label="Grand Total"
      min-width="180"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <div class="font-mono font-semibold">
          {{ toCurrency(row.grandTotal, row.currency) }}
        </div>
        <span class="text-xs text-gray-400">
          {{ toDecimal(row._count.SalesOrderItems) }} items
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

const { customerId } = defineProps({
  customerId: {
    type: Number,
    required: true,
  },
});

const request = useRequest();

const { data = [], isPending } = useQuery({
  queryKey: ["sales-orders", customerId],
  queryFn: () =>
    request(`/api/sales-orders`, { params: { customerId: customerId } }),
});
</script>
