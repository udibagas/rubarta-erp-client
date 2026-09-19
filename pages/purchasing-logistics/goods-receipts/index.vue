<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Goods Receipts">
        <template #extra>
          <div class="flex gap-2">
            <el-input
              v-model="keyword"
              placeholder="Search"
              @change="refreshData()"
              clearable
              :prefix-icon="ElIconSearch"
              class="w-50!"
            />

            <el-button :icon="ElIconPlus" type="success" @click="openForm()" />
            <el-button
              @click="refreshData()"
              :icon="ElIconRefresh"
              class="ml-0!"
            />
          </div>
        </template>
      </el-page-header>
    </template>

    <el-table
      v-loading="isPending"
      :data="data?.data ?? []"
      stripe
      height="calc(100vh - 195px)"
    >
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
            @click="
              navigateTo(`/purchasing-logistics/goods-receipts/${row.id}`)
            "
            type="success"
          >
            {{ row.number }}
          </el-link>
          <div class="text-xs text-gray-400">
            {{ formatDate(row.date) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Supplier" min-width="200">
        <template #default="{ row }">
          <div class="font-semibold line-clamp-1">
            {{ row.Supplier?.name || "-" }}
          </div>
          <div class="text-xs text-gray-400 line-clamp-1">
            PO No. {{ row.PurchaseOrder?.number }}
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

    <el-pagination
      class="p-2 bg-slate-100"
      v-if="data?.total"
      :current-page="page"
      size="small"
      background
      layout="total, sizes, prev, pager, next"
      :page-size="pageSize"
      :page-sizes="[10, 25, 50, 100]"
      :total="data?.total"
      @current-change="currentChange"
      @size-change="sizeChange"
    />

    <GoodsReceiptForm ref="goodsReceiptFormRef" @saved="() => refetch()" />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const goodsReceiptFormRef = ref(null);

const { fetchData, refreshData, keyword } = useCrud({
  url: "/api/goods-receipts",
  queryKey: "goods-receipts",
});

const { isPending, data, refetch, page, pageSize, currentChange, sizeChange } =
  fetchData();

const openForm = (data = {}) => {
  goodsReceiptFormRef.value?.openForm(data);
};
</script>
