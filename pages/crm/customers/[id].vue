<template>
  <el-page-header
    @back="goBack"
    :content="`CRM / Customers / ${customer?.name || ''}`"
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

  <br />

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
      <a class="text-green-500" :href="`mailto:${customer.email}`">{{
        customer.email || "-"
      }}</a>
    </el-descriptions-item>

    <el-descriptions-item label="Phone">
      <a class="text-green-500" :href="`tel:${customer.phone}`">
        {{ customer.phone || "-" }}
      </a>
    </el-descriptions-item>

    <el-descriptions-item label="Website">
      <a v-if="customer.website" :href="customer.website" target="_blank">
        {{ customer.website }}
      </a>
      <span v-else>-</span>
    </el-descriptions-item>

    <el-descriptions-item label="Address" :span="2">
      {{ customer.address || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Industry">
      {{ customer.industry || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Employee Count">
      {{ customer.employeeCount || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Revenue">
      <span class="font-mono font-semibold">
        {{ customer.revenue ? toCurrency(customer.revenue.toString()) : "-" }}
      </span>
    </el-descriptions-item>

    <el-descriptions-item label="Status">
      <el-tag :type="customer.isActive ? 'success' : 'danger'">
        {{ customer.isActive ? "Active" : "Inactive" }}
      </el-tag>
    </el-descriptions-item>

    <el-descriptions-item label="Created At">
      {{ formatDateLong(customer.createdAt) }}
    </el-descriptions-item>

    <el-descriptions-item label="Updated At">
      {{ formatDateLong(customer.updatedAt) }}
    </el-descriptions-item>

    <el-descriptions-item
      v-if="customer.tags && customer.tags.length > 0"
      label="Tags"
      :span="2"
    >
      <el-tag v-for="tag in customer.tags" :key="tag" style="margin-right: 8px">
        {{ tag }}
      </el-tag>
    </el-descriptions-item>
  </el-descriptions>

  <br />

  <el-tabs>
    <el-tab-pane label="LEADS">
      <el-table :data="customer.Leads" stripe>
        <el-table-column type="index" label="#"></el-table-column>

        <el-table-column
          label="Status"
          prop="status"
          width="150"
          align="center"
          header-align="center"
        >
          <template #default="{ row }">
            <StatusTag :status="row.status" style="width: 100%" effect="dark" />
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
        v-if="!leads || leads.length === 0"
        description="No leads found"
      />
    </el-tab-pane>

    <el-tab-pane label="OPPORTUNITIES">
      <el-table :data="customer.Opportunities" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="Name" prop="name" min-width="200" />
        <el-table-column label="Stage" width="150">
          <template #default="{ row }">
            <StatusTag :status="row.stage" />
          </template>
        </el-table-column>
        <el-table-column label="Amount" width="150" align="right">
          <template #default="{ row }">
            <strong>{{ toCurrency(row.amount.toString()) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Probability" width="100" align="center">
          <template #default="{ row }"> {{ row.probability }}% </template>
        </el-table-column>
        <el-table-column label="Expected Close" width="120">
          <template #default="{ row }">
            {{ formatDate(row.expectedCloseDate) }}
          </template>
        </el-table-column>
        <el-table-column width="80" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="navigateTo(`/crm/opportunities?id=${row.id}`)"
            >
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!opportunities || opportunities.length === 0"
        description="No opportunities found"
      />
    </el-tab-pane>

    <el-tab-pane label="ORDERS">
      <el-table :data="customer.Orders" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="Order Number" prop="orderNumber" width="150" />
        <el-table-column
          label="Description"
          prop="description"
          min-width="200"
        />
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="Total Amount" width="150" align="right">
          <template #default="{ row }">
            <strong>{{ toCurrency(row.totalAmount.toString()) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Order Date" width="120">
          <template #default="{ row }">
            {{ formatDate(row.orderDate) }}
          </template>
        </el-table-column>
        <el-table-column width="80" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="navigateTo(`/crm/orders?id=${row.id}`)"
            >
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!orders || orders.length === 0"
        description="No orders found"
      />
    </el-tab-pane>

    <el-tab-pane label="CONTACTS">
      <el-table :data="customer.Contacts" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="Name" prop="name" min-width="150" />
        <el-table-column label="Title" prop="title" width="150" />
        <el-table-column label="Email" prop="email" min-width="200" />
        <el-table-column label="Phone" prop="phone" width="150" />
        <el-table-column label="Is Primary" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isPrimary" type="success" size="small">
              Yes
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column width="80" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="navigateTo(`/crm/contacts?id=${row.id}`)"
            >
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!contacts || contacts.length === 0"
        description="No contacts found"
      />
    </el-tab-pane>

    <el-tab-pane label="INTERACTIONS">
      <el-table :data="customer.Interactions" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="Type" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.type" />
          </template>
        </el-table-column>
        <el-table-column label="Date" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column label="Subject" prop="subject" min-width="200" />
        <el-table-column label="Duration" width="100" align="center">
          <template #default="{ row }">
            {{ row.duration ? `${row.duration} min` : "-" }}
          </template>
        </el-table-column>
        <el-table-column label="User" prop="User.name" width="150" />
        <el-table-column label="Outcome" prop="outcome" min-width="150" />
        <el-table-column width="80" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="navigateTo(`/crm/interactions?id=${row.id}`)"
            >
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!customer.Interactions || customer.Interactions.length === 0"
        description="No interactions found"
      />
    </el-tab-pane>

    <el-tab-pane label="QUOTATIONS">
      <el-table :data="customer.Quotations" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="Number" prop="number" width="120" />
        <el-table-column label="Title" prop="title" min-width="200" />
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="Grand Total" width="150" align="right">
          <template #default="{ row }">
            <strong>{{ toCurrency(row.grandTotal.toString()) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Valid Until" width="120">
          <template #default="{ row }">
            {{ formatDate(row.validUntil) }}
          </template>
        </el-table-column>
        <el-table-column label="User" prop="User.name" width="150" />
        <el-table-column width="80" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="navigateTo(`/crm/quotations?id=${row.id}`)"
            >
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!customer.Quotations || customer.Quotations.length === 0"
        description="No quotations found"
      />
    </el-tab-pane>

    <el-tab-pane label="INVOICES">
      <el-table :data="customer.Invoices" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="Number" prop="number" width="120" />
        <el-table-column label="Order Number" width="120">
          <template #default="{ row }">
            {{ row.Order?.number || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="Issue Date" width="120">
          <template #default="{ row }">
            {{ formatDate(row.issueDate) }}
          </template>
        </el-table-column>
        <el-table-column label="Due Date" width="120">
          <template #default="{ row }">
            {{ formatDate(row.dueDate) }}
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="Total Amount" width="150" align="right">
          <template #default="{ row }">
            <strong>{{ toCurrency(row.totalAmount.toString()) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Paid Amount" width="150" align="right">
          <template #default="{ row }">
            {{ toCurrency(row.paidAmount.toString()) }}
          </template>
        </el-table-column>
        <el-table-column width="80" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="navigateTo(`/crm/invoices?id=${row.id}`)"
            >
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!customer.Invoices || customer.Invoices.length === 0"
        description="No invoices found"
      />
    </el-tab-pane>
  </el-tabs>

  <CustomerForm />
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";

const route = useRoute();
const request = useRequest();
const customerId = computed(() => route.params.id);

// Fetch customer data
const {
  data: customer,
  isPending: isLoading,
  refetch,
} = useQuery({
  queryKey: ["customer", customerId],
  queryFn: async () => {
    return await request(`/api/customers/${customerId.value}`);
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

const goBack = () => {
  navigateTo("/crm/customers");
};
</script>
