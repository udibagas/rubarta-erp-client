<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600"> PAYMENT AUTHORIZATION </span>
    </template>
    <template #extra>
      <form @submit.prevent="paymentAuthorizationStore.searchData">
        <el-button
          size="small"
          @click="
            paymentAuthorizationStore.openForm({
              companyId: companyStore.companyId,
              deduction: 0,
              PaymentAuthorizationItem: [
                { ...paymentAuthorizationStore.newRow },
              ],
            })
          "
          type="success"
          :icon="Plus"
          class="mr-2"
        >
          NEW PAYMENT AUTHORIZATION
        </el-button>

        <el-input
          size="small"
          v-model="paymentAuthorizationStore.keyword"
          placeholder="Cari"
          style="width: 180px"
          :prefix-icon="Search"
          :clearable="true"
        >
        </el-input>
      </form>
    </template>
  </el-page-header>

  <br />

  <el-table
    stripe
    v-loading="paymentAuthorizationStore.loading"
    :data="paymentAuthorizationStore.tableData.data"
  >
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Number" width="220">
      <template #default="{ row }">
        <strong>
          <NuxtLink :to="`/payment-authorizations/${row.id}`">
            {{ row.number }}</NuxtLink
          >
        </strong>
        <br />
        {{ formatDate(row.date) }}
      </template>
    </el-table-column>

    <el-table-column label="Requester" min-width="150">
      <template #default="{ row }">
        {{ row.Requester?.name }}
      </template>
    </el-table-column>

    <el-table-column label="Employee" min-width="150">
      <template #default="{ row }">
        <strong>{{ row.Employee?.name }}</strong
        ><br />
        {{ row.Bank?.code }} - {{ row.bankAccount }}
      </template>
    </el-table-column>

    <el-table-column
      label="Gross Amount"
      width="150"
      align="right"
      hader-align="right"
    >
      <template #default="{ row }">
        {{ toRupiah(row.grossAmount) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Deduction"
      width="150"
      align="right"
      hader-align="right"
    >
      <template #default="{ row }">
        {{ toRupiah(row.deduction) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Net Amount"
      width="150"
      align="right"
      hader-align="right"
    >
      <template #default="{ row }">
        <strong>{{ toRupiah(row.netAmount) }}</strong>
      </template>
    </el-table-column>

    <el-table-column
      label="Status"
      align="center"
      header-align="center"
      width="150"
      fixed="right"
    >
      <template #default="{ row }">
        <el-tag type="primary" effect="dark" style="width: 100%">{{
          row.status
        }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column
      width="60px"
      align="center"
      header-align="center"
      fixed="right"
    >
      <template #header>
        <el-button
          link
          @click="paymentAuthorizationStore.refreshData"
          :icon="Refresh"
        >
        </el-button>
      </template>
      <template #default="{ row }">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-icon>
              <MoreFilled />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                :icon="Edit"
                @click.native.prevent="paymentAuthorizationStore.openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="Delete"
                @click.native.prevent="paymentAuthorizationStore.remove(row.id)"
              >
                Delete
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>

  <br />

  <el-pagination
    v-if="paymentAuthorizationStore.tableData.total"
    size="small"
    background
    layout="total, sizes, prev, pager, next"
    :page-size="paymentAuthorizationStore.pageSize"
    :page-sizes="[10, 25, 50, 100]"
    :total="paymentAuthorizationStore.tableData.total"
    @current-change="paymentAuthorizationStore.currentChange"
    @size-change="paymentAuthorizationStore.sizeChange"
  ></el-pagination>

  <PaymentAuthorizationForm />
</template>

<script setup>
import {
  Refresh,
  Plus,
  Edit,
  Delete,
  MoreFilled,
  Search,
} from "@element-plus/icons-vue";

const paymentAuthorizationStore = usePaymentAuthorizationStore();

onMounted(() => {
  paymentAuthorizationStore.requestData();
});

const companyId = computed(() => useCookie("companyId"));

watch(companyId, () => {
  paymentAuthorizationStore.refreshData();
});

const goBack = () => {
  window.history.back();
};
</script>
