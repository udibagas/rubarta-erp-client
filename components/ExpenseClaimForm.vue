<template>
  <el-dialog
    v-model="expenseClaimStore.showForm"
    width="1000"
    title="EXPENSE CLAIM"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item
        label="Company"
        :error="expenseClaimStore.formErrors.companyId"
      >
        <el-select
          v-model="expenseClaimStore.formModel.companyId"
          placeholder="Company"
          disabled
        >
          <el-option
            v-for="(el, i) in companyStore.companies"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="Department"
        :error="expenseClaimStore.formErrors.departmentId"
      >
        <el-select
          v-model="expenseClaimStore.formModel.departmentId"
          placeholder="Department"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in departmentStore.departments"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-table :data="expenseClaimStore.formModel.ExpenseClaimItem">
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
              v-for="(el, i) in expenseTypeStore.expenseTypes"
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
            @click="expenseClaimStore.addItem"
          ></el-button>
        </template>
        <template #default="{ row, $index }">
          <el-button
            link
            :icon="Delete"
            type="danger"
            @click="expenseClaimStore.removeItem($index, row.id)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-table :data="summary">
      <el-table-column
        prop="expenseType"
        label="Expense Type"
      ></el-table-column>
      <el-table-column label="Amount" align="right" header-align="right">
        <template #default="{ row }">
          <strong>{{ toRupiah(row.amount) }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <table class="table">
      <tbody>
        <tr>
          <td class="strong">TOTAL EXPENSE</td>
          <td class="text-right">
            <strong>{{ toRupiah(totalAmount) }}</strong>
          </td>
        </tr>

        <tr>
          <td class="strong">CASH ADVANCE</td>
          <td class="text-right">
            <el-input
              type="number"
              v-model="expenseClaimStore.formModel.cashAdvance"
              placeholder="Cash Advance"
              style="width: 120px; margin-right: 10px"
            />
            <strong>{{
              toRupiah(expenseClaimStore.formModel.cashAdvance)
            }}</strong>
          </td>
        </tr>

        <tr>
          <td class="strong">{{ claim > 0 ? "CLAIM" : "REFUND" }}</td>
          <td class="text-right">
            <strong :class="claim > 0 ? 'text-success' : 'text-danger'">
              {{ toRupiah(claim) }}
            </strong>
          </td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="expenseClaimStore.closeForm">
        CANCEL
      </el-button>
      <el-button
        :icon="SuccessFilled"
        type="info"
        @click="expenseClaimStore.save('DRAFT')"
      >
        SAVE AS DRAFT
      </el-button>

      <el-button
        :icon="SuccessFilled"
        type="success"
        @click="expenseClaimStore.save('SUBMITTED')"
      >
        SUBMIT
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  Plus,
  SuccessFilled,
  CircleCloseFilled,
  Delete,
} from "@element-plus/icons-vue";

const expenseClaimStore = useExpenseClaimStore();
const companyStore = useCompanyStore();
const departmentStore = useDepartmentStore();
const expenseTypeStore = useExpenseTypeStore();

onBeforeMount(async () => {
  await expenseTypeStore.requestData();
});

const totalAmount = computed(() => {
  return (
    expenseClaimStore.formModel.ExpenseClaimItem?.reduce(
      (total, current) => total + Number(current.amount),
      0
    ) ?? 0
  );
});

const claim = computed(() => {
  return totalAmount.value - Number(expenseClaimStore.formModel.cashAdvance);
});

const summary = computed(() => {
  const summaryObj = {};
  expenseClaimStore.formModel.ExpenseClaimItem?.forEach((item) => {
    if (!summaryObj[item.expenseTypeId]) summaryObj[item.expenseTypeId] = 0;
    summaryObj[item.expenseTypeId] += item.amount;
  });
  // {1: 20000, 3: 20000, 4: 150000}
  const summaryArr = Object.keys(summaryObj).map((k) => {
    const expenseType =
      expenseTypeStore.expenseTypes.find((e) => e.id == k)?.name ?? "OTHER";
    return {
      expenseType,
      amount: summaryObj[k],
    };
  });
  return summaryArr;
});

const disabledDate = (time) => {
  return time.getTime() > Date.now();
};
</script>
