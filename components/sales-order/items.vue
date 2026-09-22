<template>
  <el-table
    :data="pagedItems"
    stripe
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
      fixed="left"
    />
    <el-table-column
      label="Part Number"
      prop="partNumber"
      width="150"
      fixed="left"
    >
      <template #default="{ row }">
        <div class="font-mono font-semibold">
          {{ row.partNumber }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Description" prop="description" min-width="150">
      <template #default="{ row }">
        <span class="line-clamp-1">
          {{ row.description }}
        </span>
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
</script>
