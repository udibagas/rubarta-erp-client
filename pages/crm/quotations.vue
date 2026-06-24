<template>
  <el-page-header @back="goBack" content="CRM / Quotations">
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
      </div>
    </template>
  </el-page-header>

  <br />

  <el-table stripe v-loading="isPending" :data="data">
    <el-table-column type="index" label="#" width="60"></el-table-column>

    <el-table-column label="Quotation #" prop="number" width="150" />

    <el-table-column label="Title" prop="title" min-width="200" />

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

    <el-table-column label="Date" width="120">
      <template #default="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>
    </el-table-column>

    <el-table-column label="Valid Until" width="120">
      <template #default="{ row }">
        {{ formatDate(row.validUntil) }}
      </template>
    </el-table-column>

    <el-table-column label="Customer" prop="Customer.name" min-width="180" />

    <el-table-column label="User" prop="User.name" width="150" />

    <el-table-column
      label="Total Amount"
      width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <span class="font-mono"> {{ toDecimal(row.totalAmount) }} </span>
      </template>
    </el-table-column>

    <el-table-column label="VAT" width="120" align="right" header-align="right">
      <template #default="{ row }">
        <span class="font-mono">{{ toDecimal(row.vatAmount) }}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Grand Total"
      width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <div class="text-green-600 font-mono font-semibold">
          {{ toDecimal(row.grandTotal) }}
        </div>
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
                @click.native.prevent="viewQuotation(row)"
              >
                View
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconEdit"
                @click.native.prevent="edit(row.id)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.status === 'Draft'"
                @click.native.prevent="markAsSent(row.id)"
              >
                Mark as Sent
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.status === 'Sent'"
                @click.native.prevent="markAsAccepted(row.id)"
              >
                Mark as Accepted
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

  <QuotationForm />
</template>

<script setup>
const {
  openForm,
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  edit,
  keyword,
  request,
} = useCrud({
  url: "/api/quotations",
  queryKey: "quotations",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();

function viewQuotation(quotation) {
  // TODO: Implement quotation view/print/PDF export
  ElMessage.info(`View quotation ${quotation.number}`);
}

async function markAsSent(quotationId) {
  try {
    await request(`/api/quotations/${quotationId}`, {
      method: "PATCH",
      body: {
        status: "Sent",
      },
    });
    ElMessage.success("Quotation marked as sent");
    refreshData();
  } catch (error) {
    ElMessage.error("Failed to update quotation status");
  }
}

async function markAsAccepted(quotationId) {
  try {
    await request(`/api/quotations/${quotationId}`, {
      method: "PATCH",
      body: {
        status: "Accepted",
      },
    });
    ElMessage.success("Quotation marked as accepted");
    refreshData();
  } catch (error) {
    ElMessage.error("Failed to update quotation status");
  }
}
</script>
