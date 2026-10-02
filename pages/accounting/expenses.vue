<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Expenses">
        <template #extra>
          <el-button :icon="ElIconPlus" type="success" @click="openForm()"
            >ADD EXPENSE</el-button
          >
        </template>
      </el-page-header>
    </template>

    <el-table
      :data="expenses"
      v-loading="isPending"
      stripe
      height="calc(100vh - 155px)"
    >
      <el-table-column label="Date" width="140"
        ><template #default="{ row }">{{
          formatDate(row.date)
        }}</template></el-table-column
      >
      <el-table-column label="Description" prop="description" min-width="260" />
      <el-table-column label="Account" min-width="200">
        <template #default="{ row }"
          >{{ row.account?.code ?? accountCode(row.accountId) }} -
          {{ row.account?.name ?? accountName(row.accountId) }}</template
        >
      </el-table-column>
      <el-table-column label="Amount" width="180" align="right"
        ><template #default="{ row }">{{
          toCurrency(row.amount)
        }}</template></el-table-column
      >
      <el-table-column fixed="right" width="60" align="center">
        <template #default="{ row }">
          <el-dropdown>
            <span class="el-dropdown-link"
              ><el-icon><ElIconMoreFilled /></el-icon
            ></span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="ElIconEdit" @click="openForm(row)"
                  >Edit</el-dropdown-item
                >
                <el-dropdown-item :icon="ElIconDelete" @click="remove(row)"
                  >Delete</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <AccountingExpenseForm
      v-model:show="showForm"
      :row="selected"
      :accounts="accounts"
      @save="save"
    />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const {
  rows: expenses,
  isPending,
  send,
} = useAccountingQuery("expenses", "/api/accounting/expenses");
const { rows: accounts } = useAccountingQuery("accounts", "/api/accounts");
const showForm = ref(false);
const selected = ref(null);
const account = (id) => accounts.value.find((item) => item.id === id);
const accountCode = (id) => account(id)?.code ?? "-";
const accountName = (id) => account(id)?.name ?? "-";

function openForm(row = null) {
  selected.value = row;
  showForm.value = true;
}

async function save(data) {
  const url = data.id
    ? `/api/accounting/expenses/${data.id}`
    : "/api/accounting/expenses";
  await send(url, data.id ? "PATCH" : "POST", {
    date: data.date,
    description: data.description,
    amount: Number(data.amount),
    accountId: Number(data.accountId),
  });
  showForm.value = false;
}

async function remove(row) {
  await ElMessageBox.confirm(`Delete expense ${row.description}?`, "Confirm", {
    type: "warning",
  })
    .then(() => send(`/api/accounting/expenses/${row.id}`, "DELETE"))
    .catch(() => {});
}
</script>
