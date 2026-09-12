<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Purchase Orders">
        <template #extra>
          <div class="flex gap-2">
            <el-input
              v-model="keyword"
              placeholder="Search"
              @change="refreshData()"
              clearable
              :prefix-icon="ElIconSearch"
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

    <el-table stripe v-loading="isPending" :data="data">
      <el-table-column label="PO Number" prop="number" min-width="150">
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
          <div class="text-sm text-gray-500">
            {{ formatDate(row.createdAt) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Supplier" min-width="200">
        <template #default="{ row }">
          <div class="font-semibold line-clamp-1">
            {{ row.Supplier?.name || "-" }}
          </div>
          <div class="text-sm text-gray-500 line-clamp-1">
            {{ row.referenceNumber }}
          </div>
          <div class="text-xs text-gray-500 line-clamp-1">
            {{ row.orderType }}
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
        label="Items"
        prop="_count.PurchaseOrderItems"
        width="80"
        align="center"
        header-align="center"
      >
        <template #default="{ row }">
          <el-tag class="font-mono" size="small" effect="plain" type="info">
            {{ toDecimal(row._count.PurchaseOrderItems) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="Grand Total"
        min-width="150"
        align="right"
        header-align="right"
      >
        <template #default="{ row }">
          <el-tag
            class="font-mono font-semibold"
            size="small"
            type="success"
            effect="plain"
          >
            {{ toCurrency(row.grandTotal, row.currency) }}
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

    <PurchaseOrderForm ref="quotationFormRef" @saved="() => refetch()" />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const quotationFormRef = ref(null);
const keyword = ref("");

const { fetchData, refreshData } = useCrud({
  url: "/api/purchase-orders",
  queryKey: "purchase-orders",
});

const { isPending, data, refetch } = fetchData();

const openForm = (data = {}) => {
  quotationFormRef.value?.openForm(data);
};
</script>
