<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600"> EXPENSE CLAIM </span>
    </template>
    <template #extra>
      <form @submit.prevent="searchData">
        <el-button
          size="small"
          @click="
            openForm({
              cashAdvance: 0,
              departmentId: user.departmentId,
              ExpenseClaimItem: [{ ...newRow }],
            })
          "
          type="success"
          :icon="Plus"
          class="mr-2"
        >
          NEW EXPENSE CLAIM
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

    <el-table-column label="Date" width="150">
      <template #default="{ row }">
        {{ formatDate(row.date) }}
      </template>
    </el-table-column>

    <el-table-column label="Employee" min-width="150">
      <template #default="{ row }">
        <strong>{{ row.User?.name }}</strong>
      </template>
    </el-table-column>

    <el-table-column label="Department" min-width="150">
      <template #default="{ row }">
        {{ row.Department?.name }}
      </template>
    </el-table-column>

    <el-table-column
      label="Cash Advance"
      min-width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        {{ toRupiah(row.cashAdvance) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Total Amount"
      min-width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        {{ toRupiah(row.totalAmount) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Claim Amount"
      min-width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <strong>{{ toRupiah(row.claim) }}</strong>
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
        <el-tag type="primary" effect="dark" style="width: 100%">
          {{ row.status }}
        </el-tag>
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
    width="1000"
    title="EXPENSE CLAIM"
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

      <el-form-item label="Department" :error="formErrors.departmentId">
        <el-select
          v-model="formModel.departmentId"
          placeholder="Department"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in departments"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-table :data="formModel.ExpenseClaimItem">
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

      <el-table-column label="EXPENSE TYPE" width="170">
        <template #default="{ row }">
          <el-select v-model="row.expenseTypeId" placeholder="Expense Type">
            <el-option
              v-for="(el, i) in expenseTypes"
              :value="el.id"
              :label="el.name"
              :key="i"
            >
            </el-option>
          </el-select>
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

    <!-- TODO: group by expense type -->

    <table class="table">
      <tbody>
        <tr>
          <td style="width: 150px">TOTAL EXPENSE</td>
          <td class="text-right">
            <strong>{{ toRupiah(totalAmount) }}</strong>
          </td>
        </tr>

        <tr>
          <td>CASH ADVANCE</td>
          <td class="text-right">
            <el-input
              type="number"
              v-model="formModel.cashAdvance"
              placeholder="Cash Advance"
              style="width: 120px; margin-right: 10px"
            />
            <strong>{{ toRupiah(formModel.cashAdvance) }}</strong>
          </td>
        </tr>

        <tr>
          <td>{{ claim > 0 ? "CLAIM" : "REFUND" }}</td>
          <td class="text-right">
            <strong :class="claim > 0 ? 'text-success' : 'text-danger'">
              {{ toRupiah(claim) }}
            </strong>
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
const { user } = useSanctumAuth();

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
const departments = computed(() => store.departments);
const expenseTypes = computed(() => store.expenseTypes);

const totalAmount = computed(() => {
  return (
    formModel.value.ExpenseClaimItem?.reduce(
      (total, current) => total + Number(current.amount),
      0
    ) ?? 0
  );
});

const claim = computed(() => {
  return totalAmount.value - Number(formModel.value.cashAdvance);
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
} = useCrud("/api/expense-claims", true);

const newRow = {
  date: undefined,
  expenseType: undefined,
  description: undefined,
  amount: undefined,
};

const addItem = () => {
  formModel.value.ExpenseClaimItem.push({ ...newRow });
};

const deleteItem = async (index, id) => {
  if (id) {
    await api(`/api/expense-claims/${formModel.value.id}/${id}`, {
      method: "DELETE",
    });
  }

  formModel.value.ExpenseClaimItem.splice(index, 1);
};

const disabledDate = (time) => {
  return time.getTime() > Date.now();
};

const saveWithStatus = (status) => {
  formModel.value.status = status;
  formModel.value.totalAmount = totalAmount;
  formModel.value.cashAdvance = Number(formModel.value.cashAdvance);
  formModel.value.claim = claim;

  formModel.value.ExpenseClaimItem.forEach((e) => {
    e.amount = Number(e.amount);
  });

  save();
};

onMounted(() => {
  requestData();
});

onBeforeMount(async () => {
  await store.getCompanies();
  await store.getDepartments();
  await store.getExpenseTypes();
});
</script>
