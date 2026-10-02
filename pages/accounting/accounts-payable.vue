<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Accounts Payable" />
    </template>

    <div class="grid grid-cols-3 gap-2 mb-2">
      <el-card shadow="never">
        <div class="text-xs text-gray-400 uppercase mb-1">Total Payable</div>
        <div class="text-lg font-semibold">
          {{ toCurrency(totalOutstanding) }}
        </div>
      </el-card>
      <el-card shadow="never">
        <div class="text-xs text-gray-400 uppercase mb-1">Overdue</div>
        <div class="text-lg font-semibold text-red-500">
          {{ toCurrency(totalOverdue) }}
        </div>
      </el-card>
      <el-card shadow="never">
        <div class="text-xs text-gray-400 uppercase mb-1">Open Bills</div>
        <div class="text-lg font-semibold">{{ openCount }}</div>
      </el-card>
    </div>

    <div class="flex gap-2 mb-2">
      <el-input
        v-model="search"
        placeholder="Search bill or vendor"
        clearable
        class="w-72!"
        :prefix-icon="ElIconSearch"
      />
      <el-select
        v-model="statusFilter"
        placeholder="Status"
        clearable
        class="w-48!"
      >
        <el-option
          v-for="s in ['OPEN', 'PARTIAL', 'OVERDUE', 'PAID']"
          :key="s"
          :value="s"
          :label="s"
        />
      </el-select>
    </div>

    <el-table
      :data="filtered"
      v-loading="isPending"
      stripe
      height="calc(100vh - 325px)"
    >
      <el-table-column label="Bill" prop="number" width="130" />
      <el-table-column label="Vendor" min-width="200">
        <template #default="{ row }">{{ row.supplier?.name ?? "-" }}</template>
      </el-table-column>
      <el-table-column label="Date" width="120">
        <template #default="{ row }">{{ formatDate(row.date) }}</template>
      </el-table-column>
      <el-table-column label="Due Date" width="120">
        <template #default="{ row }">{{ formatDate(row.dueDate) }}</template>
      </el-table-column>
      <el-table-column label="Amount" width="160" align="right">
        <template #default="{ row }">{{
          toCurrency(row.total, row.currency)
        }}</template>
      </el-table-column>
      <el-table-column label="Paid" width="160" align="right">
        <template #default="{ row }">{{
          toCurrency(row.paidAmount, row.currency)
        }}</template>
      </el-table-column>
      <el-table-column label="Outstanding" width="160" align="right">
        <template #default="{ row }">{{
          toCurrency(outstanding(row), row.currency)
        }}</template>
      </el-table-column>
      <el-table-column label="Status" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="accountingTagType(row.status)" round effect="dark">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" width="150" align="center">
        <template #default="{ row }">
          <el-button
            v-if="row.status !== 'PAID'"
            size="small"
            type="primary"
            plain
            @click="pay(row)"
          >
            PAY
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <AccountingPaymentForm
      v-model:show="showForm"
      :row="draft"
      direction="OUT"
      :cash-banks="cashBanks"
      :suppliers="suppliers"
      :documents="items"
      @save="onSave"
    />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const {
  rows: items,
  send,
  isPending,
} = useAccountingQuery("vendor-bills", "/api/accounting/vendor-bills");
const { rows: cashBanks } = useAccountingQuery(
  "cash-bank-accounts",
  "/api/accounting/cash-bank/accounts",
);
const { rows: suppliers } = useAccountingQuery("suppliers", "/api/suppliers");
const search = ref("");
const statusFilter = ref("");
const showForm = ref(false);
const draft = ref(null);

const outstanding = (r) => Number(r.total ?? 0) - Number(r.paidAmount ?? 0);
const totalOutstanding = computed(() =>
  items.value.reduce((s, r) => s + outstanding(r), 0),
);
const totalOverdue = computed(() =>
  items.value
    .filter((r) => r.status === "OVERDUE")
    .reduce((s, r) => s + outstanding(r), 0),
);
const openCount = computed(
  () => items.value.filter((r) => r.status !== "PAID").length,
);

const filtered = computed(() =>
  items.value.filter(
    (r) =>
      (!statusFilter.value || r.status === statusFilter.value) &&
      `${r.number} ${r.supplier?.name ?? ""}`
        .toLowerCase()
        .includes(search.value.toLowerCase()),
  ),
);

function pay(row) {
  draft.value = {
    direction: "OUT",
    date: new Date().toISOString().slice(0, 10),
    partyId: row.supplierId,
    documentId: row.id,
    reference: row.number,
    method: "TRANSFER",
    cashBankAccountId: cashBanks.value[0]?.id ?? null,
    amount: outstanding(row),
  };
  showForm.value = true;
}

async function onSave(payment) {
  await send("/api/accounting/payments", "POST", payment);
  showForm.value = false;
}
</script>
