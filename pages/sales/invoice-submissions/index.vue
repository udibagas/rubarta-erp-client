<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Invoice Submissions">
        <template #extra>
          <el-button :icon="ElIconPlus" type="success" @click="openForm()">
            New Submission
          </el-button>
        </template>
      </el-page-header>
    </template>

    <div
      class="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border-b border-gray-300"
    >
      <el-select
        v-model="filters.customerId"
        placeholder="Customer"
        filterable
        clearable
        default-first-option
        class="w-50!"
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

      <el-select
        v-model="filters.status"
        placeholder="Status"
        clearable
        class="w-40!"
      >
        <el-option
          v-for="s in invoiceSubmissionStatuses"
          :key="s"
          :value="s"
          :label="s"
        />
      </el-select>

      <el-input
        v-model="keyword"
        placeholder="Search by number or customer"
        clearable
        :prefix-icon="ElIconSearch"
        class="w-65! ml-auto"
      />

      <el-button @click="refetch()" :icon="ElIconRefresh" />
    </div>

    <el-table
      stripe
      v-loading="isPending"
      :data="submissions"
      height="calc(100vh - 254px)"
    >
      <template #empty>
        <el-empty description="No Items"> </el-empty>
      </template>

      <el-table-column
        label="Submission #"
        prop="number"
        min-width="150"
        fixed="left"
      >
        <template #default="{ row }">
          <el-link
            class="font-mono font-semibold!"
            @click="navigateTo(`/sales/invoice-submissions/${row.id}`)"
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
        </template>
      </el-table-column>

      <el-table-column label="Invoices" min-width="200">
        <template #default="{ row }">
          <div class="line-clamp-2">
            {{
              row.invoiceSubmissionItems
                ?.map((i) => i.Invoice?.number)
                .join(", ") || "-"
            }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Created By" min-width="150">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-avatar
              :size="30"
              :style="{ backgroundColor: getAvatarColor(row.User?.name || '') }"
              class="shrink-0"
            >
              {{ row.User?.name?.charAt(0).toUpperCase() }}
            </el-avatar>
            <div>
              <div class="line-clamp-1 font-semibold">
                {{ row.User?.name || "-" }}
              </div>
              <div class="text-xs text-gray-400">
                {{ formatDate(row.createdAt) }} {{ formatTime(row.createdAt) }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="Amount"
        min-width="150"
        align="right"
        header-align="right"
      >
        <template #default="{ row }">
          <div class="font-mono font-semibold">
            {{ toCurrency(row.amount) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="Status"
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

    <InvoiceSubmissionForm
      ref="formRef"
      @saved="
        (res) => {
          refetch();
          navigateTo(`/sales/invoice-submissions/${res.id}`);
        }
      "
    />
  </nuxt-layout>
</template>

<script setup>
import { gql } from "@apollo/client";
import { useQuery } from "@tanstack/vue-query";
import { invoiceSubmissionStatuses } from "~/constants";

definePageMeta({ layout: false });

const request = useRequest();
const formRef = ref(null);
const customers = ref([]);
const keyword = ref("");
const filters = ref({});

// The API has no pagination or keyword search, so the keyword is applied client-side
const params = computed(() =>
  Object.fromEntries(
    Object.entries(filters.value).filter(([, v]) => v !== null && v !== ""),
  ),
);

const { isPending, data, refetch } = useQuery({
  queryKey: ["invoice-submissions", params],
  queryFn: () => request("/api/invoice-submissions", { params: params.value }),
});

const submissions = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  const list = data.value ?? [];
  if (!k) return list;
  return list.filter(
    (s) =>
      s.number?.toLowerCase().includes(k) ||
      s.Customer?.name?.toLowerCase().includes(k),
  );
});

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
  formRef.value?.openForm(data);
};

useNewQuery(() => openForm());
</script>
