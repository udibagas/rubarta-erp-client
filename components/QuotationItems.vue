<template>
  <el-table :data="quotation.QuotationItems" stripe border>
    <el-table-column type="index" label="#" width="60" />
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
        <span class="font-mono">{{ toDecimal(calculateItemAmount(row)) }}</span>
      </template>
    </el-table-column>
  </el-table>

  <el-descriptions :column="1" border label-width="500">
    <el-descriptions-item label="SUBTOTAL" class-name="font-mono" align="right">
      {{ toCurrency(totals.subtotal, quotation.currency) }}
    </el-descriptions-item>
    <el-descriptions-item label="DISCOUNT" align="right" class-name="font-mono">
      {{ toCurrency(quotation.discount, quotation.currency) }}
    </el-descriptions-item>

    <!-- <el-descriptions-item
      label="VAT (11%)"
      align="right"
      class-name="font-mono"
    >
      {{ toCurrency(totals.vat, quotation.currency) }}
    </el-descriptions-item> -->

    <el-descriptions-item
      label="GRAND TOTAL"
      align="right"
      class-name="font-semibold text-green-600! font-mono"
    >
      {{ toCurrency(totals.grandTotal, quotation.currency) }}
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

const totals = computed(() => {
  if (!quotation || !quotation.QuotationItems) {
    return { subtotal: 0, vat: 0, grandTotal: 0 };
  }

  let subtotal = 0;
  let vatTotal = 0;

  quotation.QuotationItems.forEach((item) => {
    const baseAmount = item.quantity * item.unitPrice;
    const discountAmount = baseAmount * ((item.discount || 0) / 100);
    const amountAfterDiscount = baseAmount - discountAmount;

    subtotal += amountAfterDiscount;

    if (item.vat) {
      vatTotal += amountAfterDiscount * 0.11;
    }
  });

  // Apply quotation-level discount
  const quotationDiscount = quotation.discount || 0;
  subtotal -= quotationDiscount;

  return {
    subtotal,
    vat: vatTotal,
    grandTotal: subtotal + vatTotal,
  };
});

function calculateItemAmount(item) {
  const baseAmount = item.quantity * item.unitPrice;
  const discountAmount = baseAmount * ((item.discount || 0) / 100);
  const amountAfterDiscount = baseAmount - discountAmount;
  const vatAmount = item.vat ? amountAfterDiscount * 0.11 : 0;
  return amountAfterDiscount + vatAmount;
}
</script>
