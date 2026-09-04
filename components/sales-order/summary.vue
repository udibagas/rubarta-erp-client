<template>
  <el-card v-if="order" shadow="never" class="sticky top-4">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="font-semibold">SALES ORDER SUMMARY</span>
      </div>
    </template>

    <div class="space-y-4">
      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Number</div>
        <div class="mt-1 font-semibold text-base">
          {{ order.number }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Customer
        </div>
        <div class="mt-1 font-medium">
          {{ order.Customer?.name }}
        </div>
      </div>

      <div class="rounded-lg bg-green-50 p-3">
        <div class="text-xs text-gray-500 uppercase">Total Amount</div>
        <div class="mt-1 font-semibold font-mono text-lg">
          {{ toCurrency(order.grandTotal, order.currency) }}
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
          {{ order.User?.name }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Valid Until
        </div>
        <div class="mt-1 font-medium">
          {{ formatDate(order.validUntil) }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Request Type
        </div>
        <div class="mt-1 font-medium">{{ order.requestType }}</div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Contact</div>
        <div class="mt-1 text-sm space-y-1">
          <div>{{ order.contactPerson || "-" }}</div>
          <div>{{ order.contactPhone || "-" }}</div>
          <div>{{ order.contactEmail || "-" }}</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const totalItems = computed(() => {
  if (!props.order || !props.order.OrderItems) {
    return 0;
  }

  return props.order.OrderItems.reduce((sum, item) => {
    return sum + (item.quantity || 0);
  }, 0);
});
</script>
