<template>
  <el-card v-if="purchaseOrder" shadow="never" class="sticky top-4">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="font-semibold">PURCHASE ORDER SUMMARY</span>
      </div>
    </template>

    <div class="space-y-4">
      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Number</div>
        <div class="mt-1 font-semibold text-base">
          {{ purchaseOrder.number }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Supplier
        </div>
        <div class="mt-1 font-medium">
          {{ purchaseOrder.Supplier?.name || "-" }}
        </div>
      </div>

      <div class="rounded-lg bg-green-50 p-3">
        <div class="text-xs text-gray-500 uppercase">Total Amount</div>
        <div class="mt-1 font-semibold font-mono text-lg">
          {{ toCurrency(purchaseOrder.grandTotal, purchaseOrder.currency) }}
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
          Requested By
        </div>
        <div class="mt-1 font-medium">
          {{ purchaseOrder.User.name }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Delivery Date
        </div>
        <div class="mt-1 font-medium">
          {{
            purchaseOrder.deliveryDate
              ? formatDate(purchaseOrder.deliveryDate)
              : "-"
          }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Order Type
        </div>
        <div class="mt-1 font-medium">{{ purchaseOrder.orderType || "-" }}</div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Reference Number
        </div>
        <div class="mt-1 text-sm space-y-1">
          <div>{{ purchaseOrder.referenceNumber || "-" }}</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
const props = defineProps({
  purchaseOrder: {
    type: Object,
    required: true,
  },
});

const totalItems = computed(() => {
  if (!props.purchaseOrder || !props.purchaseOrder.PurchaseOrderItems) {
    return 0;
  }

  return props.purchaseOrder.PurchaseOrderItems.reduce((sum, item) => {
    return sum + (item.quantity || 0);
  }, 0);
});
</script>
