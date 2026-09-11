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
    <el-table-column label="Description" min-width="150">
      <template #default="{ row }">
        <div class="font-medium">{{ row.name }}</div>
        <div v-if="row.model || row.description" class="text-sm text-gray-500">
          {{ row.model }}
          {{ row.description }}
        </div>
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
    v-if="quotation.QuotationItems.length > pageSize"
    class="my-4 justify-end"
    layout="prev, pager, next, total"
    :total="quotation.QuotationItems.length"
    :page-size="pageSize"
    v-model:current-page="currentPage"
    background
    size="small"
  />

  <el-descriptions :column="1" border label-width="500">
    <el-descriptions-item label="SUBTOTAL" class-name="font-mono" align="right">
      {{ toCurrency(quotation.totalAmount, quotation.currency) }}
    </el-descriptions-item>
    <el-descriptions-item label="DISCOUNT" align="right" class-name="font-mono">
      {{ toCurrency(quotation.discount, quotation.currency) }}
    </el-descriptions-item>

    <el-descriptions-item
      label="VAT (11%)"
      align="right"
      class-name="font-mono"
    >
      {{ toCurrency(quotation.vatAmount, quotation.currency) }}
    </el-descriptions-item>

    <el-descriptions-item
      label="GRAND TOTAL"
      align="right"
      class-name="font-semibold text-green-600! font-mono"
    >
      {{ toCurrency(quotation.grandTotal, quotation.currency) }}
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
const { quotation } = defineProps({
  quotation: {
    type: Object,
    required: true,
  },
});

const pageSize = 15;
const currentPage = ref(1);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return quotation.QuotationItems.slice(start, start + pageSize);
});

const indexOffset = (index) => (currentPage.value - 1) * pageSize + index + 1;
</script>
