<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600"> EXPENSE NOTES </span>
    </template>
    <template #extra>
      <el-button size="small" type="danger" :icon="Checked"> CLAIM </el-button>

      <el-button
        size="small"
        @click="expenseNoteStore.openForm()"
        type="success"
        :icon="Plus"
      >
        NEW EXPENSE NOTES
      </el-button>
    </template>
  </el-page-header>

  <br />

  <el-table
    stripe
    :data="expenseNoteStore.expenseNotes"
    v-loading="expenseNoteStore.loading"
  >
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
        <el-button link @click="expenseNoteStore.requestData" :icon="Refresh">
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
                @click.native.prevent="expenseNoteStore.openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="Delete"
                @click.native.prevent="expenseNoteStore.remove(row.id)"
              >
                Delete
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>

  <el-table :data="summary">
    <el-table-column prop="expenseType" label="Expense Type"></el-table-column>
    <el-table-column label="Amount" align="right" header-align="right">
      <template #default="{ row }">
        <strong>{{ toRupiah(row.amount) }}</strong>
      </template>
    </el-table-column>
  </el-table>

  <table class="table">
    <tbody>
      <tr>
        <td>TOTAL</td>
        <td class="text-right">
          <strong>
            {{
              toRupiah(
                expenseNoteStore.expenseNotes.reduce(
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

  <ExpenseNoteForm />
</template>

<script setup>
const expenseNoteStore = useExpenseNoteStore();
const expenseTypeStore = useExpenseTypeStore();

import {
  Refresh,
  Plus,
  Edit,
  Delete,
  MoreFilled,
  Checked,
} from "@element-plus/icons-vue";

onMounted(() => {
  expenseNoteStore.requestData();
});

const goBack = () => {
  window.history.back();
};

const summary = computed(() => {
  const summaryObj = {};

  expenseNoteStore.expenseNotes.forEach((item) => {
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
</script>
