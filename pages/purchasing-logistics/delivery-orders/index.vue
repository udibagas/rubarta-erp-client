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
      <el-table-column label="DO Number" prop="number" min-width="150">
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
            {{ formatDate(row.createdAt) }}
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

      <el-table-column label="Date" width="150">
        <template #default="{ row }">
          {{ formatDate(row.date) }}
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
    </el-table>

    <DeliveryOrderForm ref="deliveryOrderFormRef" @saved="() => refetch()" />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const deliveryOrderFormRef = ref(null);
const keyword = ref("");

const { fetchData, refreshData } = useCrud({
  url: "/api/delivery-orders",
  queryKey: "delivery-orders",
});

const { isPending, data, refetch } = fetchData();

const openForm = (data = {}) => {
  deliveryOrderFormRef.value?.openForm(data);
};
</script>
