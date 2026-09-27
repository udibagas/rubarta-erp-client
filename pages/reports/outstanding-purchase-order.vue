<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Outstanding Purchase Order">
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
          </div>
        </template>
      </el-page-header>
    </template>

    <div
      class="flex flex-wrap justify-between items-center gap-2 p-3 bg-slate-50 border-b border-gray-300"
    >
      <el-select
        v-model="supplierId"
        placeholder="All Vendors"
        filterable
        clearable
        default-first-option
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

      <div class="flex items-center gap-2">
        <span class="text-gray-500 text-sm"> Group By: </span>
        <el-radio-group
          v-model="viewMode"
          size="default"
          fill="rgb(149, 212, 117)"
          @change="refetch()"
        >
          <el-radio-button value="supplier"> Supplier </el-radio-button>
          <el-radio-button value="po"> Purchase Order </el-radio-button>
          <el-radio-button value="item"> Item </el-radio-button>
        </el-radio-group>
        <el-button @click="refetch()" :icon="ElIconRefresh" />
      </div>
    </div>

    <el-table
      stripe
      v-loading="isPending"
      :data="data"
      :row-key="(row) => row.key"
      height="calc(100vh - 205px)"
    >
      <template #empty>
        <el-empty description="No Outstanding Items" />
      </template>

      <el-table-column label="Supplier" min-width="200">
        <template #default="{ row }">
          <div class="line-clamp-1">
            {{ row.supplierName }}
          </div>
        </template>
      </el-table-column>

      <el-table-column
        v-if="viewMode === 'po' || viewMode === 'item'"
        label="PO Number"
        width="140"
      >
        <template #default="{ row }"> {{ row.poNumber }}</template>
      </el-table-column>

      <el-table-column
        v-if="viewMode === 'item'"
        label="Part Number"
        width="140"
      >
        <template #default="{ row }"> {{ row.partNumber }}</template>
      </el-table-column>

      <el-table-column
        v-if="viewMode === 'item'"
        label="Description"
        min-width="180"
      >
        <template #default="{ row }">
          <div class="line-clamp-1">
            {{ row.description }}
          </div>
        </template>
      </el-table-column>

      <el-table-column
        v-if="viewMode === 'supplier'"
        label="PO Count"
        width="120"
        align="center"
      >
        <template #default="{ row }">
          {{ toDecimal(row.orderCount) }}
        </template>
      </el-table-column>

      <el-table-column label="Quantity" align="center">
        <el-table-column label="Ordered" width="130" align="center">
          <template #default="{ row }">
            {{ toDecimal(row.orderedQty) }}
          </template>
        </el-table-column>

        <el-table-column label="Received" width="130" align="center">
          <template #default="{ row }">
            {{ toDecimal(row.receivedQty) }}
          </template>
        </el-table-column>

        <el-table-column label="Outstanding" width="130" align="center">
          <template #default="{ row }">
            {{ toDecimal(row.outstandingQty) }}
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </nuxt-layout>
</template>

<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import { gql } from "@apollo/client";

const viewMode = ref<"supplier" | "po" | "item">("supplier");

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const request = useRequest();
const suppliers = ref<{ id: number; name: string }[]>([]);
const supplierId = ref<number | null>(null);

const { data, isPending, refetch } = useQuery<any[]>({
  queryKey: ["outstanding-purchase-order", supplierId.value],
  queryFn: () =>
    request("/api/purchase-orders/outstanding", {
      params: { supplierId: supplierId.value, groupBy: viewMode.value },
    }),
});

useGraphqlQuery<{ suppliers: { id: number; name: string }[] }>(gql`
  query {
    suppliers {
      id
      name
    }
  }
`).then((result) => {
  suppliers.value = result.data?.suppliers ?? [];
});

const handleExport = (format: "excel" | "pdf") => {
  const params = new URLSearchParams({
    supplierId: supplierId.value?.toString() ?? "",
    groupBy: viewMode.value,
  });
  const url = `${config.public.apiBase}/api/purchase-orders/outstanding/export/${format}?${params.toString()}`;
  window.open(url, "_blank");
};
</script>
