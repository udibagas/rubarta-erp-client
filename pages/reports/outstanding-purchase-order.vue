<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Outstanding Purchase Order">
        <template #extra>
          <form class="flex gap-2" @submit.prevent>
            <el-select
              v-model="supplierId"
              placeholder="All Vendors"
              filterable
              clearable
              class="w-52!"
              @change="refetch()"
            >
              <el-option
                v-for="supplier in supplierList"
                :key="supplier.id"
                :value="supplier.id"
                :label="supplier.name"
              />
              <template #prefix>
                <el-icon><ElIconOfficeBuilding /></el-icon>
              </template>
            </el-select>
          </form>
        </template>
      </el-page-header>
    </template>

    <div class="flex gap-2 mb-2">
      <el-card shadow="never" class="flex-1" v-loading="isPending">
        <div class="text-gray-500 text-sm">Total Outstanding Items</div>
        <div class="text-2xl font-semibold font-mono mt-1">
          {{ data?.totalOutstandingItemCount ?? 0 }}
        </div>
        <div class="text-gray-400 text-xs mt-1">
          {{ suppliers.length }} supplier(s)
        </div>
      </el-card>

      <el-card shadow="never" class="flex-1" v-loading="isPending">
        <div class="text-gray-500 text-sm">Total Outstanding Quantity</div>
        <div class="text-2xl font-semibold font-mono mt-1">
          {{ data?.totalOutstandingQuantity ?? 0 }}
        </div>
      </el-card>
    </div>

    <el-card shadow="never" body-class="p-0!">
      <template #header>
        <span>Outstanding Purchase Orders by Supplier</span>
      </template>

      <el-table
        stripe
        v-loading="isPending"
        :data="filteredSuppliers"
        row-key="supplierId"
      >
        <template #empty>
          <el-empty description="No Items"> </el-empty>
        </template>

        <el-table-column type="expand">
          <template #default="{ row }">
            <el-table :data="row.items" class="ml-8" size="small">
              <el-table-column label="Order Date" min-width="120">
                <template #default="{ row: item }">
                  {{ formatDate(item.purchaseOrderDate) }}
                </template>
              </el-table-column>

              <el-table-column label="Order No." min-width="140">
                <template #default="{ row: item }">
                  <el-link
                    class="font-mono"
                    @click="
                      navigateTo(
                        `/purchasing-logistics/orders/${item.purchaseOrderId}`,
                      )
                    "
                    type="success"
                  >
                    {{ item.purchaseOrderNumber }}
                  </el-link>
                </template>
              </el-table-column>

              <el-table-column label="Part No." min-width="120">
                <template #default="{ row: item }">
                  <div class="font-mono">{{ item.partNumber }}</div>
                </template>
              </el-table-column>

              <el-table-column label="Description" min-width="180">
                <template #default="{ row: item }">
                  <div class="line-clamp-1">{{ item.description }}</div>
                </template>
              </el-table-column>

              <el-table-column
                label="Ordered"
                width="100"
                align="right"
                header-align="right"
              >
                <template #default="{ row: item }">
                  {{ item.orderedQuantity }}
                </template>
              </el-table-column>

              <el-table-column
                label="Received"
                width="100"
                align="right"
                header-align="right"
              >
                <template #default="{ row: item }">
                  {{ item.receivedQuantity }}
                </template>
              </el-table-column>

              <el-table-column
                label="Outstanding"
                width="110"
                align="right"
                header-align="right"
              >
                <template #default="{ row: item }">
                  <div class="font-mono font-semibold">
                    {{ item.outstandingQuantity }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                label="Status"
                width="140"
                align="center"
                header-align="center"
              >
                <template #default="{ row: item }">
                  <StatusTag
                    :status="item.purchaseOrderStatus"
                    effect="light"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <el-table-column label="Supplier" min-width="240">
          <template #default="{ row }">
            <div class="line-clamp-1">{{ row.supplierName }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="Outstanding Items"
          width="160"
          align="center"
          header-align="center"
        >
          <template #default="{ row }">
            {{ row.outstandingItemCount }}
          </template>
        </el-table-column>

        <el-table-column
          label="Outstanding Quantity"
          width="180"
          align="right"
          header-align="right"
        >
          <template #default="{ row }">
            <div class="font-mono font-semibold">
              {{ row.outstandingQuantity }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </nuxt-layout>
</template>

<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import { gql } from "@apollo/client";

interface OutstandingPurchaseOrderItem {
  purchaseOrderId: number;
  purchaseOrderNumber: string;
  purchaseOrderDate: string;
  purchaseOrderStatus: string;
  purchaseOrderItemId: number;
  partNumber: string;
  description: string;
  orderedQuantity: number;
  receivedQuantity: number;
  outstandingQuantity: number;
}

interface OutstandingPurchaseOrderSupplier {
  supplierId: number;
  supplierName: string;
  outstandingItemCount: number;
  outstandingQuantity: number;
  items: OutstandingPurchaseOrderItem[];
}

interface OutstandingPurchaseOrderReport {
  data: OutstandingPurchaseOrderSupplier[];
  totalOutstandingItemCount: number;
  totalOutstandingQuantity: number;
}

definePageMeta({ layout: false });

const request = useRequest();
const search = ref("");
const supplierList = ref<{ id: number; name: string }[]>([]);
const supplierId = ref<number | null>(null);

const { data, isPending, refetch } = useQuery<OutstandingPurchaseOrderReport>({
  queryKey: ["outstanding-purchase-order"],
  queryFn: () => request("/api/report/outstanding-purchase-orders"),
});

useGraphqlQuery<{ suppliers: { id: number; name: string }[] }>(gql`
  query {
    suppliers {
      id
      name
    }
  }
`).then((result) => {
  supplierList.value = result.data?.suppliers ?? [];
});

const suppliers = computed(() => data.value?.data ?? []);

const filteredSuppliers = computed(() => {
  if (!search.value) return suppliers.value;
  const keyword = search.value.toLowerCase();
  return suppliers.value.filter((s) =>
    s.supplierName.toLowerCase().includes(keyword),
  );
});
</script>
