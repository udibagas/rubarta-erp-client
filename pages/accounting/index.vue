<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Accounting Dashboard" />
    </template>

    <div class="grid grid-cols-4 gap-2 mb-2">
      <el-card v-for="k in kpis" :key="k.label" shadow="never">
        <div class="text-xs text-gray-400 uppercase mb-1">{{ k.label }}</div>
        <div class="text-lg font-semibold" :class="k.class">
          {{ toCurrency(k.value) }}
        </div>
      </el-card>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <el-card shadow="never">
        <template #header>
          <div class="flex justify-between items-center">
            <b>Recent Journal Entries</b>
            <el-button
              link
              type="primary"
              @click="navigateTo('/accounting/journals')"
            >
              View all
            </el-button>
          </div>
        </template>
        <el-table :data="recentJournals" size="small">
          <el-table-column label="Number" prop="number" width="130" />
          <el-table-column
            label="Description"
            prop="description"
            min-width="160"
          />
          <el-table-column label="Amount" width="140" align="right">
            <template #default="{ row }">{{
              toCurrency(sumDebitCredit(row.lines).debit)
            }}</template>
          </el-table-column>
          <el-table-column label="Status" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="accountingTagType(row.status)">{{
                row.status
              }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="flex justify-between items-center">
            <b>Overdue Receivables & Payables</b>
          </div>
        </template>
        <el-table :data="overdue" size="small">
          <el-table-column label="Type" width="90">
            <template #default="{ row }">
              <el-tag
                size="small"
                :type="row.kind === 'AR' ? 'success' : 'primary'"
                effect="plain"
              >
                {{ row.kind }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Number" prop="number" width="120" />
          <el-table-column label="Party" prop="party" min-width="150" />
          <el-table-column label="Due" width="110">
            <template #default="{ row }">{{
              formatDate(row.dueDate)
            }}</template>
          </el-table-column>
          <el-table-column label="Outstanding" width="140" align="right">
            <template #default="{ row }">{{
              toCurrency(row.amount - row.paid)
            }}</template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never" class="col-span-2">
        <template #header><b>Cash & Bank Balances</b></template>
        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="a in cashBanks"
            :key="a.id"
            class="p-3 bg-gray-50 rounded-lg"
          >
            <div class="text-xs text-gray-400 uppercase">{{ a.type }}</div>
            <div class="font-semibold">{{ a.name }}</div>
            <div class="text-lg">{{ toCurrency(a.balance) }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const { rows: cashBanks } = useAccountingQuery(
  "cash-bank-accounts",
  "/api/accounting/cash-bank/accounts",
);
const { rows: recentJournals } = useAccountingQuery(
  "journals",
  "/api/accounting/journals",
);
const { rows: invoices } = useAccountingQuery("invoices", "/api/invoices");
const { rows: bills } = useAccountingQuery(
  "vendor-bills",
  "/api/accounting/vendor-bills",
);
const { rows: periods } = useAccountingQuery(
  "periods",
  "/api/accounting/periods",
);
const periodId = ref(null);
watch(
  periods,
  (items) => {
    if (periodId.value || !items.length) return;
    const today = new Date().toISOString().slice(0, 10);
    periodId.value =
      items.find((p) => p.startDate <= today && p.endDate >= today)?.id ??
      items[0].id;
  },
  { immediate: true },
);
const incomeReport = useAccountingQuery(
  "dashboard-income-statement",
  "/api/accounting/reports/income-statement",
  computed(() => ({ periodId: periodId.value })),
  { enabled: computed(() => Boolean(periodId.value)) },
);
const reportData = computed(() => incomeReport.data.value ?? {});
const outstanding = (total, paid) =>
  Math.max(0, Number(total ?? 0) - Number(paid ?? 0));
const receivableRows = computed(() =>
  invoices.value.map((invoice) => ({
    ...invoice,
    kind: "AR",
    party: invoice.Customer?.name ?? invoice.customer?.name ?? "-",
    amount: Number(invoice.grandTotal ?? invoice.total ?? 0),
    paid: Number(invoice.paidAmount ?? 0),
    settlement: invoice.status ?? "OPEN",
  })),
);
const payableRows = computed(() =>
  bills.value.map((bill) => ({
    ...bill,
    kind: "AP",
    party: bill.supplier?.name ?? "-",
    amount: Number(bill.total ?? 0),
    paid: Number(bill.paidAmount ?? 0),
    settlement: bill.status ?? "OPEN",
  })),
);
const kpis = computed(() => [
  {
    label: "Cash & Bank",
    value: cashBanks.value.reduce(
      (sum, account) => sum + Number(account.balance ?? 0),
      0,
    ),
  },
  {
    label: "Receivables",
    value: receivableRows.value.reduce(
      (sum, item) => sum + outstanding(item.amount, item.paid),
      0,
    ),
  },
  {
    label: "Payables",
    value: payableRows.value.reduce(
      (sum, item) => sum + outstanding(item.amount, item.paid),
      0,
    ),
  },
  {
    label: "Net Income",
    value: Number(reportData.value.netIncome ?? 0),
    class: "text-green-600",
  },
]);
const overdue = computed(() =>
  [...receivableRows.value, ...payableRows.value].filter(
    (item) => item.settlement === "OVERDUE",
  ),
);
</script>
