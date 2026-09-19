<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Delivery Orders">
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
      stripe
      v-loading="isPending"
      :data="data?.data ?? []"
      height="calc(100vh - 195px)"
    >
      <template #empty>
        <el-empty description="No Items"> </el-empty>
      </template>
      <el-table-column
        label="DO Number"
        prop="number"
        min-width="150"
        fixed="left"
      >
        <template #default="{ row }">
          <el-link
            class="font-mono font-semibold!"
            @click="
              navigateTo(`/purchasing-logistics/delivery-orders/${row.id}`)
            "
            type="success"
          >
            {{ row.number }}
          </el-link>
          <div class="text-sm text-gray-500">
            {{ formatDate(row.date) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Customer" min-width="200">
        <template #default="{ row }">
          <div class="font-semibold line-clamp-1">
            {{ row.Customer?.name || "-" }}
          </div>
          <div class="text-sm text-gray-500 line-clamp-1">
            {{ row.SalesOrder?.number }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Prepared By" min-width="170">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-avatar
              size="small"
              :style="{ backgroundColor: getAvatarColor(row.User?.name) }"
              class="shrink-0"
            >
              {{ row.User?.name?.charAt(0) || "?" }}
            </el-avatar>
            <span class="line-clamp-1">
              {{ row.User?.name || "-" }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Sender" prop="sender" min-width="150">
        <template #default="{ row }">
          {{ row.sender || "-" }}
        </template>
      </el-table-column>

      <el-table-column
        label="Receipt Number"
        prop="receiptNumber"
        min-width="150"
      >
        <template #default="{ row }">
          {{ row.receiptNumber || "-" }}
        </template>
      </el-table-column>

      <el-table-column
        label="Items"
        prop="_count.DeliveryOrderItems"
        width="80"
        align="center"
        header-align="center"
      >
        <template #default="{ row }">
          <el-tag class="font-mono" size="small" effect="plain" type="info">
            {{ toDecimal(row._count.DeliveryOrderItems) }}
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

    <DeliveryOrderForm ref="deliveryOrderFormRef" @saved="() => refetch()" />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const deliveryOrderFormRef = ref(null);

const { fetchData, refreshData, keyword } = useCrud({
  url: "/api/delivery-orders",
  queryKey: "delivery-orders",
});

const { isPending, data, refetch, page, pageSize, currentChange, sizeChange } =
  fetchData();

const openForm = (data = {}) => {
  deliveryOrderFormRef.value?.openForm(data);
};
</script>
