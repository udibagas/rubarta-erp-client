<template>
  <el-card v-if="quotation" shadow="never" class="sticky top-4">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="font-semibold">QUOTATION SUMMARY</span>
        <!-- <StatusTag
          :status="quotation.status || 'Draft'"
          effect="dark"
          size="small"
          :round="false"
        /> -->
      </div>
    </template>

    <div class="space-y-4">
      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Number</div>
        <div class="mt-1 font-semibold text-base">
          {{ quotationSummary.number }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Customer
        </div>
        <div class="mt-1 font-medium">
          {{ quotationSummary.customer }}
        </div>
      </div>

      <div class="rounded-lg bg-green-50 p-3">
        <div class="text-xs text-gray-500 uppercase">Total Amount</div>
        <div class="mt-1 font-semibold font-mono text-lg">
          {{ toCurrency(quotationSummary.amount, quotationSummary.currency) }}
        </div>
      </div>

      <div class="rounded-lg bg-green-50 p-3">
        <div class="text-xs text-gray-500 uppercase">Total Items</div>
        <div class="mt-1 font-semibold font-mono text-lg">
          {{ toDecimal(quotationSummary.totalItems) }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Sales Person
        </div>
        <div class="mt-1 font-medium">
          {{ quotationSummary.salesPerson }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Valid Until
        </div>
        <div class="mt-1 font-medium">
          {{ formatDate(quotationSummary.validUntil) }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Request Type
        </div>
        <div class="mt-1 font-medium">{{ quotation.requestType }}</div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Contact</div>
        <div class="mt-1 text-sm space-y-1">
          <div>{{ quotation.contactPerson || "-" }}</div>
          <div>{{ quotation.contactPhone || "-" }}</div>
          <div>{{ quotation.contactEmail || "-" }}</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
const props = defineProps({
  quotation: {
    type: Object,
    default: null,
  },
  totals: {
    type: Object,
    default: () => ({ subtotal: 0, vat: 0, grandTotal: 0 }),
  },
});

const quotationSummary = computed(() => {
  if (!props.quotation) {
    return {
      number: "-",
      customer: "-",
      amount: 0,
      totalItems: 0,
      salesPerson: "-",
      validUntil: null,
    };
  }

  const totalItems =
    props.quotation.QuotationItems?.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    ) || 0;

  return {
    number: props.quotation.number || "-",
    customer: props.quotation.Customer?.name || "-",
    amount: props.totals?.grandTotal || 0,
    currency: props.quotation.currency || "IDR",
    totalItems,
    salesPerson: props.quotation.User?.name || "-",
    validUntil: props.quotation.validUntil || null,
  };
});
</script>
