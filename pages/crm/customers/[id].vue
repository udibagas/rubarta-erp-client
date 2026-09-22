<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header
        @back="goBack"
        :content="`Customers &raquo; ${customer?.name || ''}`"
      >
        <template #extra>
          <el-button
            :icon="ElIconEdit"
            type="success"
            @click="openEditForm"
            v-if="customer"
          >
            Edit
          </el-button>
          <el-button :icon="ElIconRefresh" @click="refetch" v-if="customer" />
        </template>
      </el-page-header>
    </template>
    <el-descriptions
      v-if="customer"
      :border="true"
      :column="2"
      direction="horizontal"
    >
      <el-descriptions-item label="Name">
        <strong>{{ customer.name }}</strong>
      </el-descriptions-item>

      <el-descriptions-item label="Email">
        <el-link :href="`mailto:${customer.email}`">
          {{ customer.email || "-" }}
        </el-link>
      </el-descriptions-item>

      <el-descriptions-item label="Phone">
        <el-link :href="`tel:${customer.phone}`">
          {{ customer.phone || "-" }}
        </el-link>
      </el-descriptions-item>

      <el-descriptions-item label="Website">
        <el-link
          v-if="customer.website"
          :href="customer.website"
          target="_blank"
        >
          {{ customer.website }}
        </el-link>
        <span v-else>-</span>
      </el-descriptions-item>

      <el-descriptions-item label="Address" :span="2">
        <div class="whitespace-pre-line">
          {{ customer.address || "-" }}
        </div>
      </el-descriptions-item>

      <el-descriptions-item label="Industry">
        {{ customer.industry || "-" }}
      </el-descriptions-item>

      <el-descriptions-item label="Employee Count">
        {{ customer.employeeCount?.toLocaleString("id-ID") || "-" }}
      </el-descriptions-item>

      <el-descriptions-item label="Revenue">
        <el-tag class="font-mono" type="success" effect="plain">
          {{ customer.revenue ? toCurrency(customer.revenue.toString()) : "-" }}
        </el-tag>
      </el-descriptions-item>

      <el-descriptions-item label="Status">
        <el-tag :type="customer.isActive ? 'success' : 'danger'" effect="plain">
          {{ customer.isActive ? "Active" : "Inactive" }}
        </el-tag>
      </el-descriptions-item>

      <el-descriptions-item label="Account Manager">
        <div class="flex items-center gap-2" v-if="customer.accountManagerId">
          <el-avatar
            size="small"
            class="shrink-0"
            :style="{
              backgroundColor: getAvatarColor(customer.accountManager?.name),
            }"
          >
            {{ customer.accountManager?.name?.charAt(0) }}
          </el-avatar>
          <span>{{ customer.accountManager?.name }}</span>
        </div>
      </el-descriptions-item>

      <el-descriptions-item label="Tags">
        <el-tag
          v-for="tag in customer.tags"
          :key="tag"
          class="mr-2"
          type="info"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
      </el-descriptions-item>

      <el-descriptions-item label="Created At">
        {{ formatDateLong(customer.createdAt) }}
        {{ formatTime(customer.createdAt) }}
      </el-descriptions-item>

      <el-descriptions-item label="Updated At">
        {{ formatDateLong(customer.updatedAt) }}
        {{ formatTime(customer.updatedAt) }}
      </el-descriptions-item>
    </el-descriptions>

    <br />

    <el-tabs v-if="customer">
      <el-tab-pane label="CONTACTS">
        <CustomerContacts :customer="customer" />
      </el-tab-pane>

      <el-tab-pane label="LEADS">
        <el-table :data="customer?.Leads ?? []" stripe>
          <el-table-column type="index" label="#"></el-table-column>

          <el-table-column
            label="Status"
            prop="status"
            width="150"
            align="center"
            header-align="center"
          >
            <template #default="{ row }">
              <StatusTag
                :status="row.status"
                style="width: 100%"
                effect="dark"
              />
            </template>
          </el-table-column>

          <el-table-column label="Date" width="120">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="User" prop="User.name" min-width="150px" />
          <el-table-column label="Source" prop="source" min-width="100px" />
          <el-table-column label="Notes" prop="notes" min-width="200px" />
        </el-table>
        <el-empty
          v-if="!customer?.Leads?.length"
          description="No leads found"
        />
      </el-tab-pane>

      <el-tab-pane label="OPPORTUNITIES">
        <CrmOpportunitiesTab :customer-id="customer.id" />
      </el-tab-pane>

      <el-tab-pane label="INTERACTIONS">
        <CustomerInteractions :customer-id="customer.id" />
      </el-tab-pane>

      <el-tab-pane label="QUOTATIONS">
        <CustomerQuotations :customer-id="customer.id" />
      </el-tab-pane>

      <el-tab-pane label="ORDERS">
        <CustomerSalesOrders :customer-id="customer.id" />
      </el-tab-pane>

      <el-tab-pane label="INVOICES">
        <CustomerInvoices :customer-id="customer.id" />
      </el-tab-pane>
    </el-tabs>

    <CustomerForm />
  </nuxt-layout>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";

definePageMeta({ layout: false });

const route = useRoute();
const request = useRequest();
const customerId = computed(() => route.params.id);

// Fetch customer data
const { data: customer, refetch } = useQuery({
  queryKey: ["customer", customerId],
  queryFn: async () => {
    return request(`/api/customers/${customerId.value}`);
  },
  enabled: computed(() => !!customerId.value),
});

// Form handling
const { openForm } = useCrud({
  url: "/api/customers",
  queryKey: "customers",
});

const openEditForm = () => {
  if (customer.value) {
    openForm(customer.value);
  }
};
</script>
