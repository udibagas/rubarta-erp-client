<template>
  <el-button :icon="ElIconPlus" type="success" @click="openForm()" class="mb-4">
    Add Goods Receipt
  </el-button>

  <el-table v-loading="isPending" :data="data || []" stripe>
    <template #empty>
      <el-empty description="No Items"> </el-empty>
    </template>
    <el-table-column
      label="GR Number"
      prop="number"
      min-width="150"
      fixed="left"
    >
      <template #default="{ row }">
        <el-link
          class="font-mono font-semibold!"
          @click="navigateTo(`/purchasing-logistics/goods-receipts/${row.id}`)"
          type="success"
        >
          {{ row.number }}
        </el-link>
        <div class="text-xs text-gray-400">
          {{ formatDate(row.date) }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Sender" prop="sender" min-width="150">
      <template #default="{ row }">
        {{ row.sender || "-" }}
      </template>
    </el-table-column>

    <el-table-column label="Recipient" prop="recipient" min-width="150">
      <template #default="{ row }">
        {{ row.recipient || "-" }}
      </template>
    </el-table-column>

    <el-table-column
      label="Items"
      prop="_count.GoodsReceiptItems"
      width="80"
      align="center"
      header-align="center"
    >
      <template #default="{ row }">
        <el-tag class="font-mono" size="small" effect="plain" type="info">
          {{ toDecimal(row._count.GoodsReceiptItems) }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column
      label="Status"
      prop="status"
      width="120"
      align="center"
      header-align="center"
      fixed="right"
    >
      <template #default="{ row }">
        <StatusTag :status="row.status" effect="light" style="width: 100%" />
      </template>
    </el-table-column>
  </el-table>

  <GoodsReceiptForm ref="goodsReceiptFormRef" @saved="() => refetch()" />
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";

const goodsReceiptFormRef = ref(null);

const { purchaseOrder } = defineProps({
  purchaseOrder: {
    type: Object,
    required: true,
  },
});

const request = useRequest();

const { data, refetch, isPending } = useQuery({
  queryKey: ["goods-receipts", purchaseOrder.id],
  queryFn: () =>
    request(`/api/goods-receipts`, {
      params: {
        purchaseOrderId: purchaseOrder.id,
      },
    }),
});

const openForm = (data = {}) => {
  goodsReceiptFormRef.value?.openForm(data);
};
</script>
