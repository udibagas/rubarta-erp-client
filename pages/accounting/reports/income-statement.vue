<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Income Statement">
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

    <el-card
      v-loading="report.isFetching"
      shadow="never"
      class="max-w-3xl mx-auto"
    >
      <template v-for="section in sections" :key="section.title">
        <div class="font-semibold text-gray-700 mt-3 mb-1 uppercase text-sm">
          {{ section.title }}
        </div>
        <div
          v-for="a in section.items"
          :key="a.code"
          class="flex justify-between py-1 pl-4 text-sm"
        >
          <span>{{ a.code }} - {{ a.name }}</span>
          <span>{{ toCurrency(a.balance) }}</span>
        </div>
        <div class="flex justify-between py-1 font-semibold border-t mt-1">
          <span>Total {{ section.title }}</span>
          <span>{{ toCurrency(section.total) }}</span>
        </div>
      </template>

      <div
        class="flex justify-between py-2 mt-4 text-lg font-bold border-t-2"
        :class="netIncome >= 0 ? 'text-green-600' : 'text-red-500'"
      >
        <span>Net Income</span>
        <span>{{ toCurrency(netIncome) }}</span>
      </div>
    </el-card>
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
  "report-income-statement",
  "/api/accounting/reports/income-statement",
  computed(() => ({ periodId: periodId.value })),
  { enabled: computed(() => Boolean(periodId.value)) },
);
const reportData = computed(() => report.data.value ?? {});
const normalize = (source) =>
  (Array.isArray(source)
    ? source
    : (source?.accounts ?? source?.rows ?? [])
  ).map((row) => ({
    code: row.account?.code ?? row.code ?? "",
    name: row.account?.name ?? row.name ?? "",
    balance: Number(
      row.amount ?? row.balance ?? row.total ?? row.credit ?? row.debit ?? 0,
    ),
  }));
const revenueRows = computed(() =>
  normalize(
    reportData.value.revenueRows ??
      reportData.value.revenues ??
      reportData.value.revenue,
  ),
);
const expenseRows = computed(() =>
  normalize(
    reportData.value.expenseRows ??
      reportData.value.expenses ??
      reportData.value.expense,
  ),
);
const sections = computed(() => [
  {
    title: "Revenue",
    items: revenueRows.value,
    total:
      Number(
        reportData.value.totalRevenue ?? reportData.value.revenueTotal ?? 0,
      ) || revenueRows.value.reduce((sum, row) => sum + row.balance, 0),
  },
  {
    title: "Expense",
    items: expenseRows.value,
    total:
      Number(
        reportData.value.totalExpense ?? reportData.value.expenseTotal ?? 0,
      ) || expenseRows.value.reduce((sum, row) => sum + row.balance, 0),
  },
]);
const netIncome = computed(() =>
  Number(
    reportData.value.netIncome ??
      sections.value[0].total - sections.value[1].total,
  ),
);
</script>
