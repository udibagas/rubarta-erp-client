<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Purchase Orders">
        <template #extra>
          <div class="flex gap-2">
            <el-button @click="refetch()" :icon="ElIconRefresh" />

            <el-dropdown split-button @command="handleExport">
              <el-icon class="mr-1"><ElIconDownload /></el-icon>
              Export
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="excel" :icon="ElIconMemo">
                    Excel
                  </el-dropdown-item>
                  <el-dropdown-item command="pdf" :icon="ElIconDocument">
                    PDF
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button :icon="ElIconPlus" type="success" @click="openForm()">
              New Purchase Order
            </el-button>
          </div>
        </template>
      </el-page-header>
    </template>

    <div
      class="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border-b border-gray-300"
    >
      <div class="flex items-center gap-2">
        <el-select
          v-model="filters.supplierId"
          placeholder="Supplier"
          filterable
          clearable
          class="w-52!"
          @change="refetch()"
        >
          <el-option
            v-for="supplier in suppliers"
            :key="supplier.id"
            :value="supplier.id"
            :label="supplier.name"
          />
          <template #prefix>
            <el-icon><ElIconOfficeBuilding /></el-icon>
          </template>
        </el-select>

        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="Start"
          end-placeholder="End"
          value-format="YYYY-MM-DD"
          format="DD-MMM-YYYY"
          class="w-70!"
          @change="refetch()"
        />
      </div>

      <el-input
        v-model="keyword"
        placeholder="Search by number or supplier"
        @change="refetch()"
        clearable
        :prefix-icon="ElIconSearch"
        class="w-70! ml-auto"
      />
    </div>

    <el-table
      stripe
      v-loading="isPending"
      :data="data?.data ?? []"
      height="calc(100vh - 254px)"
      @filter-change="filterChange"
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
          <div class="text-xs text-gray-400">
            Ref No. {{ row.referenceNumber || "-" }}
          </div>
        </template>
      </el-table-column>

      <!-- <el-table-column label="Delivery Date" width="150">
        <template #default="{ row }">
          {{ row.deliveryDate ? formatDate(row.deliveryDate) : "-" }}
        </template>
      </el-table-column> -->

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
            {{ toDecimal(row._count.PurchaseOrderItems) }} parts &bull;
            {{ toDecimal(calculateItems(row)) }}
            items
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Delivery Progress" width="190">
        <template #default="{ row }">
          <el-progress
            :percentage="calculateDeliveryProgress(row)"
            :stroke-width="8"
            color="#67C23A"
            striped
          />
          <div class="text-xs text-gray-400" style="margin-top: 11px">
            {{ toDecimal(calculateReceivedItems(row)) }} items
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="Status"
        prop="status"
        width="150"
        align="center"
        header-align="center"
        fixed="right"
        column-key="status"
        :filters="purchaseOrderStatuses.map((s) => ({ text: s, value: s }))"
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
import { gql } from "@apollo/client";
import { purchaseOrderStatuses } from "~/constants";

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const purchaseOrderFormRef = ref(null);
const suppliers = ref([]);

const {
  fetchData,
  currentChange,
  sizeChange,
  filterChange,
  keyword,
  page,
  pageSize,
  filters,
} = useCrud({
  url: "/api/purchase-orders",
  queryKey: "purchase-orders",
});

const { isPending, data, refetch } = fetchData();

useGraphqlQuery(gql`
  query {
    suppliers {
      id
      name
    }
  }
`).then((result) => {
  suppliers.value = result.data.suppliers;
});

function calculateItems(row) {
  return row.PurchaseOrderItems.reduce((sum, item) => sum + item.quantity, 0);
}

function calculateReceivedItems(row) {
  return row.PurchaseOrderItems.reduce(
    (sum, item) => sum + item.receivedQuantity,
    0,
  );
}

function calculateDeliveryProgress(row) {
  const totalItems = calculateItems(row);
  const receivedItems = calculateReceivedItems(row);
  return totalItems === 0 ? 0 : Math.round((receivedItems / totalItems) * 100);
}

const openForm = (data = {}) => {
  purchaseOrderFormRef.value?.openForm(data);
};

const handleExport = (format) => {
  const url = `${config.public.apiBase}/api/purchase-orders/export/${format}`;
  window.open(url, "_blank");
};
</script>
