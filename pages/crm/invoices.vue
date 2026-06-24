<template>
  <el-page-header @back="goBack" content="CRM / Invoices">
    <template #extra>
      <div class="flex gap-2">
        <el-button
          size="small"
          :icon="ElIconPlus"
          type="success"
          @click="openForm()"
        >
          CREATE INVOICE
        </el-button>

        <el-input
          v-model="keyword"
          placeholder="Search"
          size="small"
          @change="refreshData()"
          clearable
        >
        </el-input>
      </div>
    </template>
  </el-page-header>

  <br />

  <el-table stripe v-loading="isPending" :data="data">
    <el-table-column type="index" label="#" width="60"></el-table-column>

    <el-table-column label="Invoice #" prop="number" width="150" />

    <el-table-column
      label="Status"
      prop="status"
      width="120"
      align="center"
      header-align="center"
    >
      <template #default="{ row }">
        <StatusTag :status="row.status" effect="dark" />
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

    <el-table-column label="Customer" prop="Customer.name" min-width="200" />

    <el-table-column
      label="Total Amount"
      width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        {{ toDecimal(row.totalAmount) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Paid Amount"
      width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        {{ toDecimal(row.paidAmount) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Balance"
      width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <strong
          :class="
            row.totalAmount - row.paidAmount > 0
              ? 'text-red-600'
              : 'text-green-600'
          "
        >
          {{ toDecimal(row.totalAmount - row.paidAmount) }}
        </strong>
      </template>
    </el-table-column>

    <el-table-column
      width="60px"
      align="center"
      header-align="center"
      fixed="right"
    >
      <template #header>
        <el-button link @click="refreshData()" :icon="ElIconRefresh">
        </el-button>
      </template>
      <template #default="{ row }">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-icon>
              <ElIconMoreFilled />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                :icon="ElIconView"
                @click.native.prevent="viewInvoice(row)"
              >
                View
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconEdit"
                @click.native.prevent="openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconDelete"
                @click.native.prevent="handleRemove(row.id, remove)"
              >
                Delete
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>

  <!-- InvoiceForm component would go here when created -->
  <!-- <InvoiceForm /> -->
</template>

<script setup>
const {
  openForm,
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  keyword,
} = useCrud({
  url: "/api/invoices",
  queryKey: "invoices",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();

function viewInvoice(invoice) {
  // TODO: Implement invoice view/print
  ElMessage.info(`View invoice ${invoice.number}`);
}
</script>
