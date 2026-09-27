<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Outstanding Sales Order">
        <template #extra>
          <div class="flex gap-2"></div>
        </template>
      </el-page-header>
    </template>

    <div
      class="flex flex-wrap justify-between items-center gap-2 p-3 bg-slate-50 border-b border-gray-300"
    >
      <el-select
        v-model="customerId"
        placeholder="All Vendors"
        filterable
        clearable
        class="w-52!"
        @change="refetch()"
      >
        <el-option
          v-for="supplier in customers"
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
          <el-radio-button value="customer"> Customer </el-radio-button>
          <el-radio-button value="so"> Sales Order </el-radio-button>
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

      <el-table-column label="Customer" min-width="200">
        <template #default="{ row }">
          <div class="line-clamp-1">
            {{ row.customerName }}
          </div>
        </template>
      </el-table-column>

      <el-table-column
        v-if="viewMode === 'so' || viewMode === 'item'"
        label="SO Number"
        width="140"
      >
        <template #default="{ row }"> {{ row.soNumber }}</template>
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
        v-if="viewMode === 'customer'"
        label="SO Count"
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

const viewMode = ref<"customer" | "so" | "item">("customer");

definePageMeta({ layout: false });

const request = useRequest();
const customers = ref<{ id: number; name: string }[]>([]);
const customerId = ref<number | null>(null);

const { data, isPending, refetch } = useQuery<any[]>({
  queryKey: ["outstanding-sales-order", customerId.value],
  queryFn: () =>
    request("/api/sales-orders/outstanding", {
      params: { customerId: customerId.value, groupBy: viewMode.value },
    }),
});

useGraphqlQuery<{ customers: { id: number; name: string }[] }>(gql`
  query {
    customers {
      id
      name
    }
  }
`).then((result) => {
  customers.value = result.data?.customers ?? [];
});
</script>
