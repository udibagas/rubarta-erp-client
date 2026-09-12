<template>
  <el-card
    v-if="deliveryOrder"
    shadow="never"
    class="sticky top-4 w-85 shrink-0"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="font-semibold">DELIVERY ORDER SUMMARY</span>
      </div>
    </template>

    <div class="space-y-4">
      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Number</div>
        <div class="mt-1 font-semibold text-base">
          {{ deliveryOrder.number }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Customer
        </div>
        <div class="mt-1 font-medium">
          {{ deliveryOrder.Customer?.name || "-" }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Sales Order
        </div>
        <div class="mt-1 font-medium">
          {{ deliveryOrder.SalesOrder?.number || "-" }}
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
          Prepared By
        </div>
        <div class="mt-1 font-medium">
          {{ deliveryOrder.User?.name || "-" }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Date</div>
        <div class="mt-1 font-medium">
          {{ formatDate(deliveryOrder.date) }}
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
const props = defineProps({
  deliveryOrder: {
    type: Object,
    required: true,
  },
});

const totalItems = computed(() => {
  if (!props.deliveryOrder || !props.deliveryOrder.DeliveryOrderItems) {
    return 0;
  }

  return props.deliveryOrder.DeliveryOrderItems.reduce((sum, item) => {
    return sum + (item.quantitySupply || 0);
  }, 0);
});
</script>
