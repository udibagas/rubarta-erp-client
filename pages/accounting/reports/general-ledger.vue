<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="General Ledger">
        <template #extra>
          <div class="flex gap-2">
            <el-select
              v-model="accountId"
              filterable
              clearable
              placeholder="All accounts"
              class="w-72!"
            >
              <el-option
                v-for="a in accounts"
                :key="a.id"
                :value="a.id"
                :label="`${a.code} - ${a.name}`"
              />
            </el-select>
            <el-date-picker
              v-model="range"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="Start"
              end-placeholder="End"
            />
          </div>
        </template>
      </el-page-header>
    </template>

    <div class="flex gap-2 mb-2">
      <el-card shadow="never" class="flex-1">
        <div class="text-xs text-gray-400 uppercase mb-1">Opening Balance</div>
        <div class="font-semibold">
          {{ toCurrency(reportData.openingBalance ?? 0) }}
        </div>
      </el-card>
      <el-card shadow="never" class="flex-1">
        <div class="text-xs text-gray-400 uppercase mb-1">Closing Balance</div>
        <div class="font-semibold">
          {{ toCurrency(reportData.closingBalance ?? 0) }}
        </div>
      </el-card>
    </div>

    <el-table
      :data="rows"
      v-loading="report.isFetching"
      stripe
      show-summary
      :summary-method="summary"
      height="calc(100vh - 155px)"
    >
      <el-table-column label="Date" width="120">
        <template #default="{ row }">{{ formatDate(row.date) }}</template>
      </el-table-column>
      <el-table-column label="Reference" prop="number" width="150" />
      <el-table-column label="Account" width="200">
        <template #default="{ row }"
          >{{ row.account?.code ?? row.accountCode }} -
          {{ row.account?.name ?? "" }}</template
        >
      </el-table-column>
      <el-table-column label="Description" prop="description" min-width="240" />
      <el-table-column label="Running Balance" width="180" align="right">
        <template #default="{ row }">{{
          toCurrency(row.runningBalance)
        }}</template>
      </el-table-column>
      <el-table-column label="Debit" width="170" align="right">
        <template #default="{ row }">{{
          row.debit ? toCurrency(row.debit) : "-"
        }}</template>
      </el-table-column>
      <el-table-column label="Credit" width="170" align="right">
        <template #default="{ row }">{{
          row.credit ? toCurrency(row.credit) : "-"
        }}</template>
      </el-table-column>
    </el-table>
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const { rows: accounts } = useAccountingQuery("accounts", "/api/accounts");
const accountId = ref(null);
const range = ref([
  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`,
  new Date().toISOString().slice(0, 10),
]);
const report = useAccountingQuery(
  "report-general-ledger",
  "/api/accounting/reports/general-ledger",
  computed(() => ({
    accountId: accountId.value,
    from: range.value?.[0],
    to: range.value?.[1],
  })),
  {
    enabled: computed(() =>
      Boolean(accountId.value && range.value?.[0] && range.value?.[1]),
    ),
  },
);
const reportData = computed(() => report.data.value ?? {});
const rows = computed(() => reportData.value.entries ?? []);

function summary({ columns }) {
  const totals = sumDebitCredit(rows.value);
  return columns.map((_, i) =>
    i === 0
      ? "Total"
      : i === 5
        ? toCurrency(totals.debit)
        : i === 6
          ? toCurrency(totals.credit)
          : "",
  );
}
</script>
