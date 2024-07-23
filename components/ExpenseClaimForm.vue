<template>
  <el-dialog
    v-model="ecs.showForm"
    width="1000"
    title="EXPENSE CLAIM"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Company" :error="ecs.formErrors.companyId">
        <el-select
          v-model="ecs.formModel.companyId"
          placeholder="Company"
          disabled
        >
          <el-option
            v-for="(el, i) in companies"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Department" :error="ecs.formErrors.departmentId">
        <el-select
          v-model="ecs.formModel.departmentId"
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

    <el-table :data="ecs.formModel.ExpenseClaimItem">
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
            @click="ecs.addItem"
          ></el-button>
        </template>
        <template #default="{ row, $index }">
          <el-button
            link
            :icon="Delete"
            type="danger"
            @click="ecs.removeItem($index, row.id)"
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
              v-model="ecs.formModel.cashAdvance"
              placeholder="Cash Advance"
              style="width: 120px; margin-right: 10px"
            />
            <strong>{{ toRupiah(ecs.formModel.cashAdvance) }}</strong>
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
      <el-button :icon="CircleCloseFilled" @click="ecs.closeForm">
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
import {
  Plus,
  SuccessFilled,
  CircleCloseFilled,
  Delete,
} from "@element-plus/icons-vue";

const store = useWebsiteStore();
const ecs = useExpenseClaimsStore();

const companies = computed(() => store.companies);
const departments = computed(() => store.departments);
const expenseTypes = computed(() => store.expenseTypes);

const totalAmount = computed(() => {
  return (
    ecs.formModel.ExpenseClaimItem?.reduce(
      (total, current) => total + Number(current.amount),
      0
    ) ?? 0
  );
});

const claim = computed(() => {
  return totalAmount.value - Number(ecs.formModel.cashAdvance);
});

const summary = computed(() => {
  const summaryObj = {};
  ecs.formModel.ExpenseClaimItem?.forEach((item) => {
    if (!summaryObj[item.expenseTypeId]) summaryObj[item.expenseTypeId] = 0;
    summaryObj[item.expenseTypeId] += item.amount;
  });
  // {1: 20000, 3: 20000, 4: 150000}
  const summaryArr = Object.keys(summaryObj).map((k) => {
    const expenseType =
      expenseTypes.value.find((e) => e.id == k)?.name ?? "OTHER";
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

const saveWithStatus = (status) => {
  ecs.formModel.status = status;
  ecs.formModel.totalAmount = totalAmount;
  ecs.formModel.cashAdvance = Number(formModel.cashAdvance);
  ecs.formModel.claim = claim;

  ecs.formModel.ExpenseClaimItem.forEach((e) => {
    e.amount = Number(e.amount);
  });

  save();
};
</script>
