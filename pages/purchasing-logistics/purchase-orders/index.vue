<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Purchase Orders">
        <template #extra>
          <div class="flex gap-2">
            <el-input
              v-model="keyword"
              placeholder="Search"
              @change="refetch()"
              clearable
              :prefix-icon="ElIconSearch"
              class="w-50!"
            />

            <el-button :icon="ElIconPlus" type="success" @click="openForm()" />
            <el-button @click="refetch()" :icon="ElIconRefresh" class="ml-0!" />
          </div>
        </template>
      </el-page-header>
    </template>

    <el-table
      stripe
      v-loading="isPending"
      :data="data?.data ?? []"
      height="calc(100vh - 195px)"
    >
      <template #empty>
        <el-empty description="No Items"> </el-empty>
      </template>
      <el-table-column
        label="PO Number"
        prop="number"
        min-width="150"
        fixed="left"
      >
        <template #default="{ row }">
          <el-link
            class="font-mono font-semibold!"
            @click="
              navigateTo(`/purchasing-logistics/purchase-orders/${row.id}`)
            "
            type="success"
          >
            {{ row.number }}
          </el-link>
          <div class="text-xs text-gray-400">
            {{ formatDate(row.createdAt) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Supplier" min-width="200">
        <template #default="{ row }">
          <div class="font-semibold line-clamp-1">
            {{ row.Supplier?.name || "-" }}
          </div>
          <div class="text-sm text-gray-400">
            Ref No. {{ row.referenceNumber || "-" }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Delivery Date" width="150">
        <template #default="{ row }">
          {{ row.deliveryDate ? formatDate(row.deliveryDate) : "-" }}
        </template>
      </el-table-column>

      <el-table-column label="Requested By" prop="User.name" min-width="150">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-avatar
              :size="24"
              :style="{ backgroundColor: getAvatarColor(row.User?.name || '') }"
              class="shrink-0"
            >
              {{ row.User?.name?.charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="line-clamp-1 font-semibold">
              {{ row.User?.name || "-" }}
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="Grand Total"
        min-width="170"
        align="right"
        header-align="right"
      >
        <template #default="{ row }">
          <div class="font-mono font-semibold">
            {{ toCurrency(row.grandTotal, row.currency) }}
          </div>
          <span class="text-xs text-gray-400">
            {{ toDecimal(row._count.PurchaseOrderItems) }} items
          </span>
        </template>
      </el-table-column>

      <el-table-column
        label="Status"
        prop="status"
        width="150"
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

    <PurchaseOrderForm
      ref="purchaseOrderFormRef"
      @saved="
        (res) => {
          refetch();
          navigateTo(`/purchasing-logistics/purchase-orders/${res.id}`);
        }
      "
    />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const purchaseOrderFormRef = ref(null);

const { fetchData, keyword } = useCrud({
  url: "/api/purchase-orders",
  queryKey: "purchase-orders",
});

const { isPending, data, refetch, page, pageSize, currentChange, sizeChange } =
  fetchData();

const openForm = (data = {}) => {
  purchaseOrderFormRef.value?.openForm(data);
};
</script>
