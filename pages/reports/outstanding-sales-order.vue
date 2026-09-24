<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Outstanding Sales Order">
        <template #extra>
          <form class="flex gap-2" @submit.prevent>
            <el-select
              v-model="customerId"
              placeholder="All Vendors"
              filterable
              clearable
              class="w-52!"
              @change="refetch()"
            >
              <el-option
                v-for="customer in customerList"
                :key="customer.id"
                :value="customer.id"
                :label="customer.name"
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
          {{ customers.length }} customer(s)
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
        <span>Outstanding Sales Orders by Supplier</span>
      </template>

      <el-table
        stripe
        v-loading="isPending"
        :data="filteredCustomers"
        row-key="customerId"
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
                  {{ item.deliveredQuantity }}
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
            <div class="line-clamp-1">{{ row.customerName }}</div>
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

interface OutstandingSalesOrderItem {
  purchaseOrderId: number;
  purchaseOrderNumber: string;
  purchaseOrderDate: string;
  purchaseOrderStatus: string;
  purchaseOrderItemId: number;
  partNumber: string;
  description: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  outstandingQuantity: number;
}

interface OutstandingSalesOrderSupplier {
  customerId: number;
  customerName: string;
  outstandingItemCount: number;
  outstandingQuantity: number;
  items: OutstandingSalesOrderItem[];
}

interface OutstandingSalesOrderReport {
  data: OutstandingSalesOrderSupplier[];
  totalOutstandingItemCount: number;
  totalOutstandingQuantity: number;
}

definePageMeta({ layout: false });

const request = useRequest();
const search = ref("");
const customerList = ref<{ id: number; name: string }[]>([]);
const customerId = ref<number | null>(null);

const { data, isPending, refetch } = useQuery<OutstandingSalesOrderReport>({
  queryKey: ["outstanding-sales-orders", customerId.value],
  queryFn: () =>
    request("/api/report/outstanding-sales-orders", {
      params: { customerId: customerId.value },
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
  customerList.value = result.data?.customers ?? [];
});

const customers = computed(() => data.value?.data ?? []);

const filteredCustomers = computed(() => {
  if (!search.value) return customers.value;
  const keyword = search.value.toLowerCase();
  return customers.value.filter((s) =>
    s.customerName.toLowerCase().includes(keyword),
  );
});
</script>
