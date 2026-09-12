<template>
  <el-table :data="pagedItems" stripe border>
    <el-table-column
      type="index"
      label="#"
      width="60"
      :index="(i) => (currentPage - 1) * pageSize + i + 1"
    />
    <el-table-column label="Part Number (Order)" min-width="140">
      <template #default="{ row }">
        <span class="font-mono font-semibold">
          {{ row.partNumber }}
        </span>
      </template>
    </el-table-column>
    <el-table-column label="Part Number (Supply)" min-width="140">
      <template #default="{ row }">
        <span class="font-mono font-semibold">
          {{ row.partNumberSupply }}
        </span>
      </template>
    </el-table-column>
    <el-table-column label="Description" min-width="200">
      <template #default="{ row }">
        {{ row.description }}
      </template>
    </el-table-column>
    <el-table-column label="Qty Order" width="100" align="center">
      <template #default="{ row }">
        <span class="font-mono">{{ toDecimal(row.quantityOrder) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Qty Supply" width="100" align="center">
      <template #default="{ row }">
        <span class="font-mono">{{ toDecimal(row.quantitySupply) }}</span>
      </template>
    </el-table-column>
  </el-table>

  <div
    v-if="deliveryOrder.DeliveryOrderItems.length > pageSize"
    class="flex justify-end p-3 my-2"
  >
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="deliveryOrder.DeliveryOrderItems.length"
      layout="prev, pager, next, total"
      background
      size="small"
    />
  </div>
</template>

<script setup>
const { deliveryOrder } = defineProps({
  deliveryOrder: {
    type: Object,
    required: true,
  },
});

const pageSize = 15;
const currentPage = ref(1);

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return deliveryOrder.DeliveryOrderItems.slice(start, start + pageSize);
});
</script>
