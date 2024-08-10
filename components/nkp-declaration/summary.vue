<template>
  <el-table :data="summary">
    <el-table-column prop="expenseType" label="Expense Type"></el-table-column>
    <el-table-column label="Amount" align="right" header-align="right">
      <template #default="{ row }">
        <strong>{{ toCurrency(row.amount) }}</strong>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
const { items } = defineProps(["items"]);

const summary = computed(() => {
  const summaryObj = {};
  items.forEach((item) => {
    if (!summaryObj[item.ExpenseType.name])
      summaryObj[item.ExpenseType.name] = 0;
    summaryObj[item.ExpenseType.name] += item.amount;
  });

  const summaryArr = Object.keys(summaryObj).map((k) => {
    return {
      expenseType: k,
      amount: summaryObj[k],
    };
  });

  return summaryArr;
});
</script>
