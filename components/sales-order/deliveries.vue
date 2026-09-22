<template>
  <el-table stripe :data="deliveries">
    <template #empty>
      <el-empty description="No Items"> </el-empty>
    </template>
    <el-table-column
      label="DO Number"
      prop="number"
      min-width="150"
      fixed="left"
    >
      <template #default="{ row }">
        <el-link
          class="font-mono font-semibold!"
          @click="navigateTo(`/purchasing-logistics/delivery-orders/${row.id}`)"
          type="success"
        >
          {{ row.number }}
        </el-link>
        <div class="text-sm text-gray-500">
          {{ formatDate(row.date) }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Sender" prop="sender" min-width="150">
      <template #default="{ row }">
        {{ row.sender || "-" }}
      </template>
    </el-table-column>

    <el-table-column
      label="Receipt Number"
      prop="receiptNumber"
      min-width="150"
    >
      <template #default="{ row }">
        {{ row.receiptNumber || "-" }}
      </template>
    </el-table-column>

    <el-table-column
      label="Items"
      prop="_count.DeliveryOrderItems"
      width="80"
      align="center"
      header-align="center"
    >
      <template #default="{ row }">
        <el-tag class="font-mono" size="small" effect="plain" type="info">
          {{ toDecimal(row._count.DeliveryOrderItems) }}
        </el-tag>
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
const { deliveries } = defineProps(["deliveries"]);
</script>
