<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Trial Balance">
        <template #extra>
          <el-select
            v-model="periodId"
            placeholder="Fiscal period"
            class="w-56!"
          >
            <el-option
              v-for="period in periods"
              :key="period.id"
              :value="period.id"
              :label="period.name"
            />
          </el-select>
        </template>
      </el-page-header>
    </template>

    <el-table
      :data="rows"
      v-loading="report.isFetching"
      stripe
      show-summary
      :summary-method="summary"
      height="calc(100vh - 155px)"
    >
      <el-table-column label="Code" width="120">
        <template #default="{ row }">{{
          row.account?.code ?? row.code
        }}</template>
      </el-table-column>
      <el-table-column label="Account" min-width="240">
        <template #default="{ row }">{{
          row.account?.name ?? row.name
        }}</template>
      </el-table-column>
      <el-table-column label="Type" width="130">
        <template #default="{ row }">{{
          row.account?.type ?? row.type
        }}</template>
      </el-table-column>
      <el-table-column label="Period Debit" width="180" align="right">
        <template #default="{ row }">{{
          toCurrency(row.periodDebit ?? row.debit ?? 0)
        }}</template>
      </el-table-column>
      <el-table-column label="Period Credit" width="180" align="right">
        <template #default="{ row }">{{
          toCurrency(row.periodCredit ?? row.credit ?? 0)
        }}</template>
      </el-table-column>
      <el-table-column label="Ending Debit" width="180" align="right">
        <template #default="{ row }">{{
          row.endingDebit ? toCurrency(row.endingDebit) : "-"
        }}</template>
      </el-table-column>
      <el-table-column label="Ending Credit" width="180" align="right">
        <template #default="{ row }">{{
          row.endingCredit ? toCurrency(row.endingCredit) : "-"
        }}</template>
      </el-table-column>
    </el-table>
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

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
const report = useAccountingQuery(
  "report-trial-balance",
  "/api/accounting/reports/trial-balance",
  computed(() => ({ periodId: periodId.value })),
  { enabled: computed(() => Boolean(periodId.value)) },
);
const reportData = computed(() => report.data.value ?? {});
const rows = computed(
  () => reportData.value.accounts ?? reportData.value.rows ?? [],
);

function summary({ columns }) {
  return columns.map((_, i) => {
    if (i === 1) return "Total";
    if (i === 3)
      return toCurrency(
        reportData.value.totalPeriodDebit ??
          reportData.value.periodDebit ??
          reportData.value.totals?.periodDebit ??
          0,
      );
    if (i === 4)
      return toCurrency(
        reportData.value.totalPeriodCredit ??
          reportData.value.periodCredit ??
          reportData.value.totals?.periodCredit ??
          0,
      );
    if (i === 5)
      return toCurrency(
        reportData.value.totalDebit ?? reportData.value.totals?.debit ?? 0,
      );
    if (i === 6)
      return toCurrency(
        reportData.value.totalCredit ?? reportData.value.totals?.credit ?? 0,
      );
    return "";
  });
}
</script>
