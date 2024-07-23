<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600"> PAYMENT AUTHORIZATION </span>
    </template>
    <template #extra>
      <form @submit.prevent="searchData">
        <el-button
          size="small"
          @click="
            openForm({
              deduction: 0,
              PaymentAuthorizationItem: [{ ...newRow }],
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
          v-model="keyword"
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

  <el-table stripe v-loading="loading" :data="tableData.data">
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
        <el-button link @click="refreshData" :icon="Refresh"> </el-button>
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
                @click.native.prevent="openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="Delete"
                @click.native.prevent="deleteData(row.id)"
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
    v-if="tableData.total"
    size="small"
    background
    layout="total, sizes, prev, pager, next"
    :page-size="pageSize"
    :page-sizes="[10, 25, 50, 100]"
    :total="tableData.total"
    @current-change="currentChange"
    @size-change="sizeChange"
  ></el-pagination>

  <el-dialog
    v-model="showForm"
    width="900"
    title="PAYMENT AUTHORIZATION"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Company" :error="formErrors.companyId">
        <el-select v-model="formModel.companyId" placeholder="Company">
          <el-option
            v-for="(el, i) in companies"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Employee" :error="formErrors.employeeId">
        <el-select
          v-model="formModel.employeeId"
          placeholder="Employee"
          @change="updateBank"
        >
          <el-option
            v-for="(el, i) in users"
            :value="el.id"
            :label="el.name"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Bank" :error="formErrors.bankId">
        <el-select
          v-model="formModel.bankId"
          placeholder="Bank"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in banks"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Bank Account" :error="formErrors.bankAccount">
        <el-input v-model="formModel.bankAccount" placeholder="Bank Account" />
      </el-form-item>

      <el-form-item label="Description" :error="formErrors.description">
        <el-input
          type="textarea"
          :rows="3"
          v-model="formModel.description"
          placeholder="Description"
        />
      </el-form-item>
    </el-form>

    <el-table :data="formModel.PaymentAuthorizationItem">
      <el-table-column type="index" label="#"></el-table-column>

      <el-table-column label="DATE" width="170">
        <template #default="{ row }">
          <el-date-picker
            v-model="row.date"
            type="date"
            placeholder="Date"
            :disabled-date="disabledDate"
            format="DD-MMM-YYYY"
            style="width: 140px"
          />
        </template>
      </el-table-column>

      <el-table-column label="DESCRIPTION">
        <template #default="{ row }">
          <el-input
            type="textarea"
            v-model="row.description"
            placeholder="Description"
            :rows="1"
            clearable
          />
        </template>
      </el-table-column>

      <el-table-column label="AMOUNT" width="150">
        <template #default="{ row }">
          <el-input type="number" v-model="row.amount" placeholder="Amount">
          </el-input>
        </template>
      </el-table-column>

      <el-table-column width="120" align="right">
        <template #default="{ row }">
          <strong>{{ toRupiah(row.amount) }}</strong>
        </template>
      </el-table-column>

      <el-table-column width="50" header-align="center" align="center">
        <template #header>
          <el-button
            link
            :icon="Plus"
            type="success"
            @click="addItem"
          ></el-button>
        </template>
        <template #default="{ row, $index }">
          <el-button
            link
            :icon="Delete"
            type="danger"
            @click="deleteItem($index, row.id)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <table class="table">
      <tbody>
        <tr>
          <td>GRAND TOTAL/GROSS AMOUNT</td>
          <td class="text-right">
            <strong>{{ toRupiah(amount) }}</strong>
          </td>
        </tr>

        <tr>
          <td>DEDUCTION</td>
          <td class="text-right">
            <el-input
              type="number"
              v-model="formModel.deduction"
              placeholder="Deduction"
              style="width: 120px; margin-right: 10px"
            />
            <strong>{{ toRupiah(formModel.deduction) }}</strong>
          </td>
        </tr>

        <tr>
          <td>NET AMOUNT</td>
          <td class="text-right">
            <strong>{{ toRupiah(netAmount) }}</strong>
          </td>
        </tr>

        <tr>
          <td>TERBILANG</td>
          <td>
            <strong>Terbilang</strong>
          </td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="closeForm">
        CANCEL
      </el-button>
      <el-button
        :icon="SuccessFilled"
        type="info"
        @click="saveWithStatus('DRAFT')"
      >
        SAVE AS DRAFT
      </el-button>

      <el-button
        :icon="SuccessFilled"
        type="success"
        @click="saveWithStatus('SUBMITTED')"
      >
        SUBMIT
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const goBack = () => {
  window.history.back();
};

const store = useWebsiteStore();

import {
  Refresh,
  Plus,
  SuccessFilled,
  CircleCloseFilled,
  Edit,
  Delete,
  MoreFilled,
  Search,
} from "@element-plus/icons-vue";

const companies = computed(() => store.companies);
const users = computed(() => store.users);
const banks = computed(() => store.banks);
const amount = computed(() => {
  return (
    formModel.value.PaymentAuthorizationItem?.reduce(
      (total, current) => total + Number(current.amount),
      0
    ) ?? 0
  );
});

const netAmount = computed(() => {
  return amount.value - Number(formModel.value.deduction);
});

const {
  showForm,
  formErrors,
  formModel,
  tableData,
  loading,
  openForm,
  save,
  deleteData,
  closeForm,
  requestData,
  refreshData,
  api,
  keyword,
  pageSize,
  currentChange,
  sizeChange,
  searchData,
} = useCrud("/api/payment-authorizations", true);

const newRow = {
  date: undefined,
  description: undefined,
  amount: undefined,
};

const addItem = () => {
  formModel.value.PaymentAuthorizationItem.push({ ...newRow });
};

const deleteItem = async (index, id) => {
  if (id) {
    await api(`/api/payment-authorizations/${formModel.value.id}/${id}`, {
      method: "DELETE",
    });
  }

  formModel.value.PaymentAuthorizationItem.splice(index, 1);
};

const disabledDate = (time) => {
  return time.getTime() > Date.now();
};

const saveWithStatus = (status) => {
  formModel.value.grossAmount = amount;
  formModel.value.netAmount = netAmount;
  formModel.value.deduction = Number(formModel.value.deduction);

  formModel.value.PaymentAuthorizationItem.forEach((e) => {
    e.amount = Number(e.amount);
  });

  formModel.value.amount = amount;
  formModel.value.status = status;
  save();
};

const updateBank = (id) => {
  const user = users.value.find((u) => u.id == id);
  if (user) {
    formModel.value.bankId = user.bankId;
    formModel.value.bankAccount = user.bankAccount;
  }
};

onMounted(() => {
  requestData();
});

onBeforeMount(async () => {
  await store.getCompanies();
  await store.getBanks();
  await store.getUsers();
});
</script>
