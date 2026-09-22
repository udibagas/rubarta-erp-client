<template>
  <el-table stripe v-loading="isPending" :data="data">
    <template #empty>
      <el-empty description="No Items"> </el-empty>
    </template>
    <el-table-column label="Number" prop="number" min-width="150" fixed="left">
      <template #default="{ row }">
        <el-link
          class="font-mono font-semibold!"
          @click="navigateTo(`/sales/quotations/${row.id}`)"
          type="success"
        >
          {{ row.number }}
        </el-link>
        <div class="text-xs text-gray-400">
          {{ formatDate(row.createdAt) }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Contact" min-width="200">
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

    <el-table-column label="Valid Until" width="120">
      <template #default="{ row }">
        {{ formatDate(row.validUntil) }} <br />
        <div class="text-xs text-gray-400">{{ row.validity }} days</div>
      </template>
    </el-table-column>

    <el-table-column label="Sales Person" prop="User.name" min-width="150">
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
      min-width="170"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <div class="font-mono font-semibold">
          {{ toCurrency(row.grandTotal, row.currency) }}
        </div>
        <span class="text-xs text-gray-400">
          {{ toDecimal(row._count.QuotationItems) }} items
        </span>
      </template>
    </el-table-column>

    <el-table-column
      label="Status"
      prop="status"
      width="145"
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
const { customerId } = defineProps(["customerId"]);

const { data = [], isPending } = useQuery({
  queryKey: ["quotations", customerId],
  queryFn: () => request("/api/quotations", { params: { customerId } }),
});
</script>
