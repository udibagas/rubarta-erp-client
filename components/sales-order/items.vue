<template>
  <div class="flex gap-2 mb-4">
    <el-tag effect="plain" size="large" class="font-semibold">
      Total Ordered: {{ toDecimal(totalOrdered) }}
    </el-tag>
    <el-tag type="success" effect="plain" size="large" class="font-semibold">
      Total Delivered: {{ toDecimal(totalDelivered) }}
    </el-tag>
    <el-tag
      :type="totalOutstanding > 0 ? 'danger' : 'success'"
      effect="plain"
      size="large"
      class="font-semibold"
    >
      Outstanding: {{ toDecimal(totalOutstanding) }}
    </el-tag>
  </div>

  <el-table
    :data="pagedItems"
    stripe
    border
    :row-class-name="
      ({ row }) => (row.quantity > row.deliveredQuantity ? 'text-red-500!' : '')
    "
  >
    <el-table-column
      type="index"
      label="#"
      width="50"
      :index="(i) => (currentPage - 1) * pageSize + i + 1"
      header-align="center"
      align="center"
    />
    <el-table-column label="Part Number" prop="partNumber" min-width="150">
      <template #default="{ row }">
        <div class="font-mono font-semibold">
          {{ row.partNumber }}
        </div>
        <div class="text-xs text-gray-500 line-clamp-1">
          {{ row.description }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Quantity" header-align="center">
      <el-table-column label="Ordered" width="105" align="center">
        <template #default="{ row }">
          <span class="font-mono">{{ toDecimal(row.quantity) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Delivered" width="105" align="center">
        <template #default="{ row }">
          <span class="font-mono">{{ toDecimal(row.deliveredQuantity) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Remaining" width="105" align="center">
        <template #default="{ row }">
          <span class="font-mono">
            {{ toDecimal(row.quantity - row.deliveredQuantity) }}
          </span>
        </template>
      </el-table-column>
    </el-table-column>

    <el-table-column
      label="Unit Price"
      width="140"
      align="right"
      header-align="center"
    >
      <template #default="{ row }">
        <span class="font-mono">{{ toDecimal(row.unitPrice) }}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Amount"
      width="160"
      align="right"
      header-align="center"
    >
      <template #default="{ row }">
        <span class="font-mono">{{ toDecimal(row.totalPrice) }}</span>
      </template>
    </el-table-column>
  </el-table>

  <div
    v-if="order.SalesOrderItems.length > pageSize"
    class="flex justify-end p-3 my-2"
  >
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="order.SalesOrderItems.length"
      layout="prev, pager, next, total"
      background
      size="small"
    />
  </div>

  <el-descriptions :column="1" border label-width="500">
    <el-descriptions-item label="SUBTOTAL" class-name="font-mono" align="right">
      {{ toCurrency(order.totalAmount, order.currency) }}
    </el-descriptions-item>
    <el-descriptions-item label="DISCOUNT" align="right" class-name="font-mono">
      {{ toCurrency(order.discount, order.currency) }}
    </el-descriptions-item>

    <el-descriptions-item
      label="VAT (11%)"
      align="right"
      class-name="font-mono"
    >
      {{ toCurrency(order.vatAmount, order.currency) }}
    </el-descriptions-item>

    <el-descriptions-item
      label="GRAND TOTAL"
      align="right"
      class-name="font-semibold text-green-600! font-mono"
    >
      {{ toCurrency(order.grandTotal, order.currency) }}
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
const { order } = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const pageSize = 15;
const currentPage = ref(1);

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return order.SalesOrderItems.slice(start, start + pageSize);
});

const totalOrdered = computed(() => {
  return order.SalesOrderItems.reduce((sum, item) => sum + item.quantity, 0);
});

const totalDelivered = computed(() => {
  return order.SalesOrderItems.reduce(
    (sum, item) => sum + item.deliveredQuantity,
    0,
  );
});

const totalOutstanding = computed(() => {
  return totalOrdered.value - totalDelivered.value;
});
</script>
