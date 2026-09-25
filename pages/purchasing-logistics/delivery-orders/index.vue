<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Delivery Orders">
        <template #extra>
          <div class="flex gap-2">
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
              New Delivery Order
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
          v-model="filters.customerId"
          placeholder="Customer"
          filterable
          clearable
          class="w-52!"
          @change="refetch()"
        >
          <el-option
            v-for="customer in customers"
            :key="customer.id"
            :value="customer.id"
            :label="customer.name"
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
        placeholder="Search by number or customer"
        @change="refetch()"
        clearable
        :prefix-icon="ElIconSearch"
        class="w-70! ml-auto"
      />

      <el-button @click="refetch()" :icon="ElIconRefresh" />
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

      <el-table-column
        label="Reference No."
        prop="referenceNumber"
        min-width="150"
      >
        <template #default="{ row }">
          {{ row.SalesOrder?.referenceNumber || row.referenceNumber || "-" }}
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
        label="Parts"
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
        column-key="status"
        :filters="deliveryOrderStatuses.map((s) => ({ text: s, value: s }))"
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

    <DeliveryOrderForm
      ref="deliveryOrderFormRef"
      @saved="
        (res) => {
          refetch();
          navigateTo(`/purchasing-logistics/delivery-orders/${res.id}`);
        }
      "
    />
  </nuxt-layout>
</template>

<script setup>
import { gql } from "@apollo/client";
import { deliveryOrderStatuses } from "~/constants";

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const deliveryOrderFormRef = ref(null);

const {
  keyword,
  page,
  filters,
  pageSize,
  fetchData,
  currentChange,
  sizeChange,
  filterChange,
} = useCrud({
  url: "/api/delivery-orders",
  queryKey: "delivery-orders",
});

const { isPending, data, refetch } = fetchData();

const customers = ref([]);

useGraphqlQuery(gql`
  query {
    customers {
      id
      name
    }
  }
`).then((result) => {
  customers.value = result.data.customers;
});

const openForm = (data = {}) => {
  deliveryOrderFormRef.value?.openForm(data);
};

const handleExport = (format) => {
  const params = new URLSearchParams({
    keyword: keyword,
    ...filters,
  }).toString();

  const url = `${config.public.apiBase}/api/delivery-orders/export/${format}?${params}`;
  window.open(url, "_blank");
};
</script>
