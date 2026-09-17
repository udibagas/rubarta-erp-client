<template>
  <div class="flex gap-2 mb-4">
    <el-tag effect="plain" size="large" class="font-semibold">
      Total Ordered: {{ toDecimal(totalOrdered) }}
    </el-tag>
    <el-tag type="success" effect="plain" size="large" class="font-semibold">
      Total Received: {{ toDecimal(totalReceived) }}
    </el-tag>
    <el-tag
      :type="totalOutstanding > 0 ? 'danger' : 'success'"
      effect="plain"
      size="large"
      class="font-semibold"
    >
      Outstanding: {{ toDecimal(totalOutstanding) }}
    </el-tag>
  </div>

  <el-table
    :data="pagedItems"
    border
    stripe
    :row-class-name="
      ({ row }) =>
        row.quantityReceived < row.quantityOrder ? 'text-red-500!' : ''
    "
  >
    <el-table-column
      type="index"
      label="#"
      width="50"
      :index="(i) => (currentPage - 1) * pageSize + i + 1"
      fixed="left"
      header-align="center"
      align="center"
    />
    <el-table-column label="Part Number" header-align="center" fixed="left">
      <el-table-column label="Order" min-width="140" header-align="center">
        <template #default="{ row }">
          <span class="font-mono font-semibold">
            {{ row.partNumber }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Supplied" min-width="140" header-align="center">
        <template #default="{ row }">
          <span class="font-mono font-semibold">
            {{ row.partNumberSupplier }}
          </span>
        </template>
      </el-table-column>
    </el-table-column>

    <el-table-column label="Description" min-width="200" header-align="center">
      <template #default="{ row }">
        {{ row.description }}
      </template>
    </el-table-column>

    <el-table-column label="Quantity" header-align="center" align="center">
      <el-table-column
        label="Ordered"
        width="100"
        header-align="center"
        align="center"
      >
        <template #default="{ row }">
          <span class="font-mono">{{ toDecimal(row.quantityOrder) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="Received"
        width="110"
        header-align="center"
        align="center"
      >
        <template #default="{ row }">
          <span class="font-mono">{{ toDecimal(row.quantityReceived) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="Remaining"
        width="110"
        header-align="center"
        align="center"
      >
        <template #default="{ row }">
          <span class="font-mono">{{
            toDecimal(row.quantityOrder - row.quantityReceived)
          }}</span>
        </template>
      </el-table-column>
    </el-table-column>
  </el-table>

  <div
    v-if="goodsReceipt.GoodsReceiptItems.length > pageSize"
    class="flex justify-end p-3 my-2"
  >
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="goodsReceipt.GoodsReceiptItems.length"
      layout="prev, pager, next, total"
      background
      size="small"
    />
  </div>
</template>

<script setup>
const { goodsReceipt } = defineProps({
  goodsReceipt: {
    type: Object,
    required: true,
  },
});

const pageSize = 15;
const currentPage = ref(1);

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return goodsReceipt.GoodsReceiptItems.slice(start, start + pageSize);
});

const totalOrdered = computed(() => {
  return goodsReceipt.GoodsReceiptItems.reduce(
    (sum, item) => sum + (item.quantityOrder || 0),
    0,
  );
});

const totalReceived = computed(() => {
  return goodsReceipt.GoodsReceiptItems.reduce(
    (sum, item) => sum + (item.quantityReceived || 0),
    0,
  );
});

const totalOutstanding = computed(() => {
  return totalOrdered.value - totalReceived.value;
});
</script>
