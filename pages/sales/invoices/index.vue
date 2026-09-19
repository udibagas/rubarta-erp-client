<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Sales / Invoices">
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

    <el-table
      stripe
      v-loading="isPending"
      :data="data?.data ?? []"
      height="calc(100vh - 200px)"
    >
      <template #empty>
        <el-empty description="No Items"> </el-empty>
      </template>
      <el-table-column label="Invoice #" prop="number" min-width="150">
        <template #default="{ row }">
          <el-link
            class="font-mono font-semibold!"
            @click="navigateTo(`/sales/invoices/${row.id}`)"
            type="success"
          >
            {{ row.number }}
          </el-link>
          <div class="text-xs text-gray-400">
            {{ formatDate(row.date) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Customer" min-width="200">
        <template #default="{ row }">
          <div class="font-semibold line-clamp-1">
            {{ row.Customer?.name || "-" }}
          </div>
          <div class="text-xs text-gray-400 line-clamp-1">
            Ref No. {{ row.referenceNumber }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="SO / DO" min-width="200">
        <template #default="{ row }">
          <div>
            {{ row.SalesOrder?.number || "-" }}
          </div>
          <div>
            {{ row.DeliveryOrder?.number }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Due Date" width="120">
        <template #default="{ row }">
          <div>
            {{ formatDate(row.dueDate) }}
          </div>
          <div class="text-xs text-gray-400">
            {{ dayjs(row.dueDate).fromNow() }}
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="Grand Total"
        min-width="150"
        align="right"
        header-align="right"
      >
        <template #default="{ row }">
          <div class="font-mono font-semibold">
            {{ toCurrency(row.grandTotal, row.currency) }}
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

    <InvoiceForm ref="invoiceFormRef" @saved="() => refetch()" />
  </nuxt-layout>
</template>

<script setup>
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

definePageMeta({ layout: false });

const invoiceFormRef = ref(null);
const keyword = ref("");

const { fetchData, refreshData } = useCrud({
  url: "/api/invoices",
  queryKey: "invoices",
});

const { isPending, data, refetch, page, pageSize, currentChange, sizeChange } =
  fetchData();

const openForm = (data = {}) => {
  invoiceFormRef.value?.openForm(data);
};
</script>
