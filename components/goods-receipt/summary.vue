<template>
  <el-card
    v-if="goodsReceipt"
    shadow="never"
    class="sticky top-4 w-85 shrink-0"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="font-semibold">GOODS RECEIPT SUMMARY</span>
      </div>
    </template>

    <div class="space-y-4">
      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Number</div>
        <div class="mt-1 font-semibold text-base">
          {{ goodsReceipt.number }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Supplier
        </div>
        <div class="mt-1 font-medium">
          {{ goodsReceipt.Supplier?.name || "-" }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Purchase Order
        </div>
        <div class="mt-1 font-medium">
          {{ goodsReceipt.PurchaseOrder?.number || "-" }}
        </div>
      </div>

      <div class="rounded-lg bg-green-50 p-3">
        <div class="text-xs text-gray-500 uppercase">Total Items Received</div>
        <div class="mt-1 font-semibold font-mono text-lg">
          {{ toDecimal(totalItems) }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">
          Received By
        </div>
        <div class="mt-1 font-medium">
          {{ goodsReceipt.User?.name || "-" }}
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Date</div>
        <div class="mt-1 font-medium">
          {{ formatDate(goodsReceipt.date) }}
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
const props = defineProps({
  goodsReceipt: {
    type: Object,
    required: true,
  },
});

const totalItems = computed(() => {
  if (!props.goodsReceipt || !props.goodsReceipt.GoodsReceiptItems) {
    return 0;
  }

  return props.goodsReceipt.GoodsReceiptItems.reduce((sum, item) => {
    return sum + (item.quantityReceived || 0);
  }, 0);
});
</script>
