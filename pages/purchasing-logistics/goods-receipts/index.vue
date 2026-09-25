<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Goods Receipts">
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
              New Goods Receipt
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
      v-loading="isPending"
      :data="data?.data ?? []"
      stripe
      height="calc(100vh - 254px)"
      @filter-change="filterChange"
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
        label="Parts"
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
        column-key="status"
        :filters="goodsReceiptStatuses.map((s) => ({ text: s, value: s }))"
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

    <GoodsReceiptForm
      ref="goodsReceiptFormRef"
      @saved="
        (res) => {
          refetch();
          navigateTo(`/purchasing-logistics/goods-receipts/${res.id}`);
        }
      "
    />
  </nuxt-layout>
</template>

<script setup>
import { goodsReceiptStatuses } from "~/constants";
import { gql } from "@apollo/client";

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const suppliers = ref([]);
const goodsReceiptFormRef = ref(null);

const {
  fetchData,
  currentChange,
  sizeChange,
  filterChange,
  keyword,
  filters,
  page,
  pageSize,
} = useCrud({
  url: "/api/goods-receipts",
  queryKey: "goods-receipts",
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

const openForm = (data = {}) => {
  goodsReceiptFormRef.value?.openForm(data);
};

const handleExport = (format) => {
  const params = new URLSearchParams({
    keyword: keyword,
    ...filters,
  }).toString();

  const url = `${config.public.apiBase}/api/goods-receipts/export/${format}?${params}`;
  window.open(url, "_blank");
};
</script>
