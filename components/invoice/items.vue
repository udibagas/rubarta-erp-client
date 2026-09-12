<template>
  <el-table :data="paginatedItems" stripe border>
    <el-table-column type="index" label="#" width="60" :index="indexOffset" />
    <el-table-column label="Part Number" prop="partNumber" width="130">
      <template #default="{ row }">
        <span class="font-mono font-semibold">
          {{ row.partNumber }}
        </span>
      </template>
    </el-table-column>
    <el-table-column label="Description" min-width="200">
      <template #default="{ row }">
        {{ row.description }}
      </template>
    </el-table-column>
    <el-table-column label="Qty" width="80" align="center">
      <template #default="{ row }">
        <span class="font-mono">{{ toDecimal(row.quantity) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Unit Price" width="120" align="right">
      <template #default="{ row }">
        <span class="font-mono">{{ toDecimal(row.unitPrice) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Amount" width="120" align="right">
      <template #default="{ row }">
        <span class="font-mono">{{ toDecimal(row.totalPrice) }}</span>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination
    v-if="invoice.InvoiceItems.length > pageSize"
    class="my-4 justify-end"
    layout="prev, pager, next, total"
    :total="invoice.InvoiceItems.length"
    :page-size="pageSize"
    v-model:current-page="currentPage"
    background
    size="small"
  />

  <el-descriptions :column="1" border label-width="500">
    <el-descriptions-item label="SUBTOTAL" class-name="font-mono" align="right">
      {{ toDecimal(invoice.totalAmount) }}
    </el-descriptions-item>
    <el-descriptions-item label="DISCOUNT" align="right" class-name="font-mono">
      {{ toDecimal(invoice.discount) }}
    </el-descriptions-item>

    <el-descriptions-item
      label="VAT (11%)"
      align="right"
      class-name="font-mono"
    >
      {{ toDecimal(invoice.vatAmount) }}
    </el-descriptions-item>

    <el-descriptions-item
      label="GRAND TOTAL"
      align="right"
      class-name="font-semibold text-green-600! font-mono"
    >
      {{ toDecimal(invoice.grandTotal) }}
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
const { invoice } = defineProps({
  invoice: {
    type: Object,
    required: true,
  },
});

const pageSize = 15;
const currentPage = ref(1);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return invoice.InvoiceItems.slice(start, start + pageSize);
});

const indexOffset = (index) => (currentPage.value - 1) * pageSize + index + 1;
</script>
