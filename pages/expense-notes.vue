<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600"> EXPENSE NOTES </span>
    </template>
    <template #extra>
      <el-button size="small" type="danger" :icon="Checked"> CLAIM </el-button>

      <el-button size="small" @click="openForm()" type="success" :icon="Plus">
        NEW EXPENSE NOTES
      </el-button>
    </template>
  </el-page-header>

  <br />

  <el-table :data="tableData" stripe v-loading="loading">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column width="120" label="Date">
      <template #default="{ row }">
        {{ formatDate(row.date) }}
      </template>
    </el-table-column>

    <el-table-column width="150" label="Expense Type">
      <template #default="{ row }">
        {{ row.expenseType?.name }}
      </template>
    </el-table-column>

    <el-table-column
      min-width="100"
      label="Description"
      prop="description"
    ></el-table-column>

    <el-table-column
      width="150"
      label="Amount"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <strong>{{ toRupiah(row.amount) }}</strong>
      </template>
    </el-table-column>

    <el-table-column
      fixed="right"
      width="60px"
      align="center"
      header-align="center"
    >
      <template #header>
        <el-button link @click="requestData" :icon="Refresh"> </el-button>
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

  <table class="table">
    <tbody>
      <tr>
        <td>TOTAL</td>
        <td class="text-right" style="padding-right: 71px">
          <strong>
            {{
              toRupiah(
                tableData.reduce(
                  (total, current) => total + Number(current.amount),
                  0
                )
              )
            }}
          </strong>
        </td>
      </tr>
    </tbody>
  </table>

  <el-dialog
    v-model="showForm"
    title="EXPENSE NOTES"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Date" :error="formErrors.date">
        <el-date-picker
          v-model="formModel.date"
          type="date"
          placeholder="Date"
          :disabled-date="disabledDate"
          format="DD-MMM-YYYY"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Expense Type" :error="formErrors.expenseTypeId">
        <el-select v-model="formModel.expenseTypeId" placeholder="Expense Type">
          <el-option
            v-for="(el, i) in expenseTypes"
            :value="el.id"
            :label="el.name"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Description" :error="formErrors.description">
        <el-input
          type="textarea"
          v-model="formModel.description"
          placeholder="Description"
          :rows="1"
        />
      </el-form-item>

      <el-form-item label="Amount" :error="formErrors.amount">
        <div class="flex">
          <el-input
            type="number"
            v-model="formModel.amount"
            placeholder="Amount"
            class="mr-2"
          />
          <strong>{{ toRupiah(formModel.amount) }}</strong>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="closeForm">
        CANCEL
      </el-button>
      <el-button :icon="SuccessFilled" type="success" @click="submit()">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const store = useWebsiteStore();

import {
  Refresh,
  Plus,
  SuccessFilled,
  CircleCloseFilled,
  Edit,
  Delete,
  MoreFilled,
  Checked,
} from "@element-plus/icons-vue";

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
} = useCrud("/api/expense-notes");

const expenseTypes = computed(() => store.expenseTypes);

const goBack = () => {
  window.history.back();
};

const disabledDate = (time) => {
  return time.getTime() > Date.now();
};

const submit = () => {
  formModel.value.amount = Number(formModel.value.amount);
  save();
};

onMounted(() => {
  requestData();
});

onBeforeMount(async () => {
  await store.getExpenseTypes();
});
</script>
