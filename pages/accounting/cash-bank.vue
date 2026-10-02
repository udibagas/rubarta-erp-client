<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Cash & Bank">
        <template #extra>
          <el-button :icon="ElIconPlus" @click="openAccountForm()">
            NEW ACCOUNT
          </el-button>
          <el-button :icon="ElIconPlus" type="success" @click="showTrx = true">
            NEW TRANSACTION
          </el-button>
        </template>
      </el-page-header>
    </template>

    <div class="grid grid-cols-3 gap-2 mb-2">
      <el-card
        v-for="a in accounts"
        :key="a.id"
        shadow="never"
        class="cursor-pointer"
        :class="{ 'border-green-500!': selectedId === a.id }"
        @click="selectedId = selectedId === a.id ? null : a.id"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs text-gray-400 uppercase">
              {{ a.type }}{{ a.accountNumber ? ` - ${a.accountNumber}` : "" }}
            </div>
            <div class="font-semibold">{{ a.name }}</div>
          </div>
          <el-button link :icon="ElIconEdit" @click.stop="openAccountForm(a)" />
        </div>
        <div class="text-lg font-semibold mt-2">
          {{ toCurrency(a.balance) }}
        </div>
      </el-card>
    </div>

    <el-table
      :data="filteredTrx"
      v-loading="isPending || transactionsQuery.isFetching"
      stripe
      height="calc(100vh - 290px)"
    >
      <el-table-column label="Date" width="120">
        <template #default="{ row }">{{ formatDate(row.date) }}</template>
      </el-table-column>
      <el-table-column label="Account" min-width="160">
        <template #default="{ row }">{{
          row.cashBankAccount?.name ?? accountOf(row.cashBankAccountId)?.name
        }}</template>
      </el-table-column>
      <el-table-column label="Description" prop="description" min-width="240" />
      <el-table-column label="Money In" width="160" align="right">
        <template #default="{ row }">
          <span class="text-green-600">{{
            row.type === "IN" ? toCurrency(row.amount) : "-"
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Money Out" width="160" align="right">
        <template #default="{ row }">
          <span class="text-red-500">{{
            row.type === "OUT" ? toCurrency(row.amount) : "-"
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Reconciled" width="120" align="center">
        <template #default="{ row }">
          <el-checkbox
            :model-value="row.reconciled"
            @change="setReconciled(row, $event)"
          />
        </template>
      </el-table-column>
    </el-table>

    <CashBankAccountForm
      v-model:show="showAccount"
      :row="selectedAccount"
      :accounts="glAccounts"
      @save="saveAccount"
    />
    <BankTransactionForm
      v-model:show="showTrx"
      :cash-banks="accounts"
      :gl-accounts="glAccounts"
      :periods="periods"
      :default-account-id="selectedId"
      @save="saveTrx"
    />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const {
  rows: accounts,
  send,
  isPending,
} = useAccountingQuery(
  "cash-bank-accounts",
  "/api/accounting/cash-bank/accounts",
);
const selectedId = ref(null);
const { rows: glAccounts } = useAccountingQuery("accounts", "/api/accounts");
const { rows: periods } = useAccountingQuery(
  "periods",
  "/api/accounting/periods",
);
const transactionParams = computed(() =>
  selectedId.value ? { cashBankAccountId: selectedId.value } : {},
);
const transactionsQuery = useAccountingQuery(
  "cash-bank-transactions",
  "/api/accounting/cash-bank/transactions",
  transactionParams,
);
const transactions = transactionsQuery.rows;
const showAccount = ref(false);
const showTrx = ref(false);
const selectedAccount = ref(null);

const accountOf = (id) => accounts.value.find((a) => a.id === id);
const filteredTrx = computed(() => transactions.value);

function openAccountForm(row = null) {
  selectedAccount.value = row;
  showAccount.value = true;
}

async function saveAccount(data) {
  const payload = {
    name: data.name,
    type: data.type,
    accountId: Number(data.accountId),
    bankName: data.bankName || undefined,
    accountNumber: data.accountNumber || undefined,
    accountHolder: data.accountHolder || undefined,
    currency: data.currency || "IDR",
    openingBalance: Number(data.openingBalance) || 0,
    isActive: data.isActive,
  };
  const url = data.id
    ? `/api/accounting/cash-bank/accounts/${data.id}`
    : "/api/accounting/cash-bank/accounts";
  await send(url, data.id ? "PATCH" : "POST", payload);
  showAccount.value = false;
}

async function saveTrx(data) {
  const payload = {
    cashBankAccountId: data.accountId,
    date: data.date,
    description: data.description,
    type: data.type,
    amount: data.amount,
    offsetAccountId: data.offsetAccountId,
    journalNumber: `JV-${data.date.slice(0, 4)}-${Date.now()}`,
    periodId: data.periodId,
  };
  await send("/api/accounting/cash-bank/transactions", "POST", payload);
  showTrx.value = false;
}

async function setReconciled(row, reconciled) {
  const action = reconciled ? "reconcile" : "unreconcile";
  await send(
    `/api/accounting/cash-bank/transactions/${row.id}/${action}`,
    "POST",
  );
}
</script>
