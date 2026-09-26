<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Outstanding Purchase Order">
        <template #extra>
          <div class="flex gap-2"></div>
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
        Group By:
        <el-radio-group
          v-model="viewMode"
          size="default"
          fill="rgb(149, 212, 117)"
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
      :data="groupedRows"
      :row-key="(row) => row.key"
      height="calc(100vh - 205px)"
    >
      <template #empty>
        <el-empty description="No Outstanding Items" />
      </template>

      <el-table-column type="expand">
        <template #default="{ row }">
          <el-table :data="row.items" class="ml-8" size="small">
            <el-table-column label="Supplier" min-width="200">
              <template #default="{ row: item }">
                {{ item.supplierName }}
              </template>
            </el-table-column>
            <el-table-column label="PO No." min-width="140">
              <template #default="{ row: item }">
                <el-link
                  class="font-mono"
                  type="success"
                  @click="
                    navigateTo(
                      `/purchasing-logistics/orders/${item.purchaseOrderId}`,
                    )
                  "
                >
                  {{ item.purchaseOrderNumber }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="Date" width="130">
              <template #default="{ row: item }">
                {{ formatDate(item.date) }}
              </template>
            </el-table-column>
            <el-table-column label="Part No." min-width="130">
              <template #default="{ row: item }">
                <span class="font-mono">{{ item.partNumber }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Description" min-width="180">
              <template #default="{ row: item }">
                {{ item.description }}
              </template>
            </el-table-column>
            <el-table-column label="Ordered" width="100" align="right">
              <template #default="{ row: item }">
                {{ item.quantity }}
              </template>
            </el-table-column>
            <el-table-column label="Received" width="100" align="right">
              <template #default="{ row: item }">
                {{ item.receivedQuantity }}
              </template>
            </el-table-column>
            <el-table-column label="Outstanding" width="120" align="right">
              <template #default="{ row: item }">
                <span class="font-mono font-semibold">
                  {{ item.outstandingQuantity }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="Outstanding Value"
              width="180"
              align="right"
            >
              <template #default="{ row: item }">
                <span class="font-mono">
                  {{ toCurrency(String(item.outstandingValue), row.currency) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>

      <template v-if="viewMode === 'supplier'">
        <el-table-column label="Supplier" min-width="240">
          <template #default="{ row }">{{ row.supplierName }}</template>
        </el-table-column>
        <el-table-column label="PO Count" width="150" align="center">
          <template #default="{ row }">{{ row.orderCount }}</template>
        </el-table-column>
        <el-table-column label="Outstanding Parts" width="200" align="center">
          <template #default="{ row }">{{ row.outstandingItemCount }}</template>
        </el-table-column>
      </template>

      <template v-else-if="viewMode === 'po'">
        <el-table-column label="PO No." min-width="160">
          <template #default="{ row }">
            <el-link
              class="font-mono"
              type="success"
              @click="
                navigateTo(
                  `/purchasing-logistics/orders/${row.purchaseOrderId}`,
                )
              "
            >
              {{ row.purchaseOrderNumber }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="Date" width="140">
          <template #default="{ row }">{{ formatDate(row.date) }}</template>
        </el-table-column>
        <el-table-column label="Supplier" min-width="220">
          <template #default="{ row }">{{ row.supplierName }}</template>
        </el-table-column>
        <el-table-column label="Reference No." min-width="150">
          <template #default="{ row }">{{
            row.referenceNumber || "-"
          }}</template>
        </el-table-column>
        <el-table-column label="Outstanding Items" width="170" align="center">
          <template #default="{ row }">{{ row.outstandingItemCount }}</template>
        </el-table-column>
      </template>

      <template v-else>
        <el-table-column label="Part No." min-width="160">
          <template #default="{ row }">
            <span class="font-mono">{{ row.partNumber }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Description" min-width="220">
          <template #default="{ row }">{{ row.description }}</template>
        </el-table-column>
        <el-table-column label="Suppliers" width="120" align="center">
          <template #default="{ row }">{{ row.supplierCount }}</template>
        </el-table-column>
        <el-table-column label="Purchase Orders" width="150" align="center">
          <template #default="{ row }">{{ row.orderCount }}</template>
        </el-table-column>
        <el-table-column label="Outstanding Items" width="170" align="center">
          <template #default="{ row }">{{ row.outstandingItemCount }}</template>
        </el-table-column>
      </template>

      <el-table-column
        label="Outstanding Qty"
        width="160"
        align="right"
        header-align="right"
      >
        <template #default="{ row }">
          <span class="font-mono font-semibold">
            {{ row.outstandingQuantity }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="Outstanding Value"
        width="190"
        align="right"
        header-align="right"
      >
        <template #default="{ row }">
          <span class="font-mono font-semibold">
            {{ toCurrency(String(row.outstandingValue), row.currency) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </nuxt-layout>
</template>

<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import { gql } from "@apollo/client";

interface OutstandingPurchaseOrderItem {
  partNumber: string;
  description: string;
  quantity: number;
  receivedQuantity: number;
  totalPrice: number;
}

interface OutstandingPurchaseOrder {
  id: number;
  number: string;
  date: string;
  referenceNumber: string | null;
  currency: string;
  grandTotal: number;
  Supplier: { id: number; name: string };
  PurchaseOrderItems: OutstandingPurchaseOrderItem[];
}

interface OutstandingLine extends OutstandingPurchaseOrderItem {
  key: string;
  purchaseOrderId: number;
  purchaseOrderNumber: string;
  date: string;
  referenceNumber: string | null;
  currency: string;
  supplierId: number;
  supplierName: string;
  outstandingQuantity: number;
  outstandingValue: number;
}

interface GroupedRow {
  key: string;
  supplierName?: string;
  purchaseOrderId?: number;
  purchaseOrderNumber?: string;
  date?: string;
  referenceNumber?: string | null;
  currency?: string;
  partNumber?: string;
  description?: string;
  orderCount?: number;
  supplierCount?: number;
  outstandingItemCount: number;
  outstandingQuantity: number;
  outstandingValue: number;
  items: OutstandingLine[];
}

const viewMode = ref<"supplier" | "po" | "item">("supplier");

definePageMeta({ layout: false });

const request = useRequest();
const suppliers = ref<{ id: number; name: string }[]>([]);
const supplierId = ref<number | null>(null);

const { data, isPending, refetch } = useQuery<OutstandingPurchaseOrder[]>({
  queryKey: ["outstanding-purchase-order", supplierId.value],
  queryFn: () =>
    request("/api/purchase-orders/outstanding", {
      params: { supplierId: supplierId.value },
    }),
});

const viewModeLabel = computed(() =>
  viewMode.value === "po" ? "Purchase Order" : viewMode.value,
);

const outstandingLines = computed<OutstandingLine[]>(() =>
  (data.value ?? []).flatMap((order) =>
    order.PurchaseOrderItems.flatMap((item, index) => {
      const outstandingQuantity = Math.max(
        0,
        item.quantity - item.receivedQuantity,
      );
      if (!outstandingQuantity) return [];

      return [
        {
          ...item,
          key: `${order.id}-${index}`,
          purchaseOrderId: order.id,
          purchaseOrderNumber: order.number,
          date: order.date,
          referenceNumber: order.referenceNumber,
          currency: order.currency,
          supplierId: order.Supplier.id,
          supplierName: order.Supplier.name,
          outstandingQuantity,
          outstandingValue:
            item.quantity > 0
              ? (item.totalPrice * outstandingQuantity) / item.quantity
              : 0,
        },
      ];
    }),
  ),
);

const groupedRows = computed<GroupedRow[]>(() => {
  const groups = new Map<string, GroupedRow>();

  for (const line of outstandingLines.value) {
    const key =
      viewMode.value === "supplier"
        ? `supplier-${line.supplierId}`
        : viewMode.value === "po"
          ? `po-${line.purchaseOrderId}`
          : `item-${line.partNumber}-${line.description}`;
    let group = groups.get(key);

    if (!group) {
      group = {
        key,
        supplierName: line.supplierName,
        purchaseOrderId:
          viewMode.value === "po" ? line.purchaseOrderId : undefined,
        purchaseOrderNumber:
          viewMode.value === "po" ? line.purchaseOrderNumber : undefined,
        date: viewMode.value === "po" ? line.date : undefined,
        referenceNumber:
          viewMode.value === "po" ? line.referenceNumber : undefined,
        currency: line.currency,
        partNumber: viewMode.value === "item" ? line.partNumber : undefined,
        description: viewMode.value === "item" ? line.description : undefined,
        orderCount: 0,
        supplierCount: 0,
        outstandingItemCount: 0,
        outstandingQuantity: 0,
        outstandingValue: 0,
        items: [],
      };
      groups.set(key, group);
    }

    group.items.push(line);
    group.outstandingItemCount += 1;
    group.outstandingQuantity += line.outstandingQuantity;
    group.outstandingValue += line.outstandingValue;
  }

  for (const group of groups.values()) {
    group.orderCount = new Set(
      group.items.map((line) => line.purchaseOrderId),
    ).size;
    group.supplierCount = new Set(
      group.items.map((line) => line.supplierId),
    ).size;
  }

  return [...groups.values()];
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
</script>
