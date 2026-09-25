<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Sales Orders">
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
              New Sales Order
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
        label="Order No."
        prop="number"
        min-width="150"
        fixed="left"
      >
        <template #default="{ row }">
          <el-link
            class="font-mono font-semibold!"
            @click="navigateTo(`/sales/orders/${row.id}`)"
            type="success"
          >
            {{ row.number }}
          </el-link>
          <div class="text-xs text-gray-400">
            {{ formatDate(row.createdAt) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Customer" min-width="200">
        <template #default="{ row }">
          <div class="font-semibold line-clamp-1">
            {{ row.Customer?.name || "-" }}
          </div>
          <div class="text-xs text-gray-400">
            Ref No. {{ row.referenceNumber }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Contact Person" min-width="180">
        <template #default="{ row }">
          <div class="font-semibold line-clamp-1">
            {{ row.contactPerson }}
          </div>
          <div class="text-xs text-gray-400 line-clamp-1">
            {{ row.contactEmail }}
          </div>
          <div class="text-xs text-gray-400 line-clamp-1">
            {{ row.contactPhone }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Created By" min-width="180">
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
        width="180"
        align="right"
        header-align="right"
      >
        <template #default="{ row }">
          <div class="font-mono font-semibold">
            {{ toCurrency(row.grandTotal, row.currency) }}
          </div>
          <span class="text-xs text-gray-400">
            {{ toDecimal(row._count.SalesOrderItems) }} parts &bull;
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
            {{ toDecimal(calculateDeliveredItems(row)) }} items
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Invoice Progress" width="190">
        <template #default="{ row }">
          <el-progress
            :percentage="calculateInvoiceProgress(row)"
            :stroke-width="8"
            color="#67C23A"
            striped
          />
          <div class="text-xs text-gray-400" style="margin-top: 11px">
            {{ toCurrency(calculatePaidInvoice(row), row.currency) }}
          </div>
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
        :filters="
          orderStatuses.map((v) => ({
            text: v,
            value: v,
          }))
        "
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

    <SalesOrderForm
      ref="orderFormRef"
      @saved="
        (res) => {
          refetch();
          navigateTo(`/sales/orders/${res.id}`);
        }
      "
    />
  </nuxt-layout>
</template>

<script setup>
import { gql } from "@apollo/client";
import { orderStatuses } from "~/constants";

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const orderFormRef = ref(null);
const customers = ref([]);

const {
  keyword,
  filters,
  page,
  pageSize,
  fetchData,
  currentChange,
  sizeChange,
  filterChange,
} = useCrud({
  url: "/api/sales-orders",
  queryKey: "orders",
});

const { isPending, data, refetch } = fetchData();

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
  orderFormRef.value?.openForm(data);
};

const handleExport = (format) => {
  const params = new URLSearchParams({
    keyword: keyword,
    ...filters,
  }).toString();

  const url = `${config.public.apiBase}/api/sales-orders/export/${format}?${params}`;
  window.open(url, "_blank");
};

function calculateItems(row) {
  return row.SalesOrderItems.reduce((sum, item) => sum + item.quantity, 0);
}

function calculateDeliveredItems(row) {
  return row.SalesOrderItems.reduce(
    (sum, item) => sum + item.deliveredQuantity,
    0,
  );
}

function calculateDeliveryProgress(row) {
  const totalItems = calculateItems(row);
  const deliveredItems = calculateDeliveredItems(row);
  return totalItems === 0 ? 0 : Math.round((deliveredItems / totalItems) * 100);
}

function calculatePaidInvoice(row) {
  return row.Invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
}

function calculateInvoiceProgress(row) {
  const paidInvoice = calculatePaidInvoice(row);

  return paidInvoice === 0
    ? 0
    : Math.round((paidInvoice / row.grandTotal) * 100);
}
</script>
