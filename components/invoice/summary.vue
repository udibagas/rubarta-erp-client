<template>
  <el-card v-if="invoice" shadow="never" class="sticky top-4 w-85 shrink-0">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="font-semibold">INVOICE SUMMARY</span>
      </div>
    </template>

    <div class="space-y-4">
      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Number</div>
        <div class="mt-1 font-semibold text-base">
          {{ invoice.number }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Customer
        </div>
        <div class="mt-1 font-medium">
          {{ invoice.Customer?.name || "-" }}
        </div>
      </div>

      <div class="rounded-lg bg-green-50 p-3">
        <div class="text-xs text-gray-500 uppercase">Grand Total</div>
        <div class="mt-1 font-semibold font-mono text-lg">
          {{ toDecimal(invoice.grandTotal) }}
        </div>
      </div>

      <div class="rounded-lg bg-red-50 p-3">
        <div class="text-xs text-gray-500 uppercase">Balance Due</div>
        <div class="mt-1 font-semibold font-mono text-lg">
          {{ toDecimal(balanceDue) }}
        </div>
      </div>

      <div class="rounded-lg bg-green-50 p-3">
        <div class="text-xs text-gray-500 uppercase">Total Items</div>
        <div class="mt-1 font-semibold font-mono text-lg">
          {{ toDecimal(totalItems) }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Sales Person
        </div>
        <div class="mt-1 font-medium">
          {{ invoice.User?.name || "-" }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Due Date
        </div>
        <div class="mt-1 font-medium">
          {{ formatDate(invoice.dueDate) }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Payment Method
        </div>
        <div class="mt-1 font-medium">{{ invoice.paymentMethod || "-" }}</div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Contact</div>
        <div class="mt-1 text-sm space-y-1">
          <div>{{ invoice.contactPerson || "-" }}</div>
          <div>{{ invoice.contactPhone || "-" }}</div>
          <div>{{ invoice.contactEmail || "-" }}</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
const props = defineProps({
  invoice: {
    type: Object,
    required: true,
  },
});

const totalItems = computed(() => {
  if (!props.invoice || !props.invoice.InvoiceItems) {
    return 0;
  }

  return props.invoice.InvoiceItems.reduce((sum, item) => {
    return sum + (item.quantity || 0);
  }, 0);
});

const paidAmount = computed(() => {
  if (!props.invoice || !props.invoice.Payments) {
    return 0;
  }

  return props.invoice.Payments.reduce((sum, payment) => {
    return sum + (payment.amount || 0);
  }, 0);
});

const balanceDue = computed(() => {
  return (props.invoice.grandTotal || 0) - paidAmount.value;
});
</script>
