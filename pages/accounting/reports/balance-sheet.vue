<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Balance Sheet">
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

    <div v-loading="report.isFetching" class="grid grid-cols-2 gap-2">
      <el-card shadow="never">
        <template #header><b>ASSETS</b></template>
        <div
          v-for="a in assets.items"
          :key="a.code"
          class="flex justify-between py-1 text-sm"
        >
          <span>{{ a.code }} - {{ a.name }}</span>
          <span>{{ toCurrency(a.balance) }}</span>
        </div>
        <div class="flex justify-between py-2 font-bold border-t mt-2">
          <span>Total Assets</span>
          <span>{{ toCurrency(assets.total) }}</span>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header><b>LIABILITIES & EQUITY</b></template>
        <div class="font-semibold text-sm text-gray-500 mb-1">Liabilities</div>
        <div
          v-for="a in liabilities.items"
          :key="a.code"
          class="flex justify-between py-1 text-sm"
        >
          <span>{{ a.code }} - {{ a.name }}</span>
          <span>{{ toCurrency(a.balance) }}</span>
        </div>
        <div class="flex justify-between py-1 font-semibold border-t mt-1">
          <span>Total Liabilities</span>
          <span>{{ toCurrency(liabilities.total) }}</span>
        </div>

        <div class="font-semibold text-sm text-gray-500 mt-3 mb-1">Equity</div>
        <div
          v-for="a in equity.items"
          :key="a.code"
          class="flex justify-between py-1 text-sm"
        >
          <span>{{ a.code }} - {{ a.name }}</span>
          <span>{{ toCurrency(a.balance) }}</span>
        </div>
        <div class="flex justify-between py-1 text-sm">
          <span>Current Year Earnings</span>
          <span>{{ toCurrency(netIncome) }}</span>
        </div>
        <div class="flex justify-between py-1 font-semibold border-t mt-1">
          <span>Total Equity</span>
          <span>{{ toCurrency(equity.total + netIncome) }}</span>
        </div>

        <div class="flex justify-between py-2 font-bold border-t-2 mt-4">
          <span>Total Liabilities & Equity</span>
          <span>{{
            toCurrency(liabilities.total + equity.total + netIncome)
          }}</span>
        </div>
      </el-card>
    </div>
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
  "report-balance-sheet",
  "/api/accounting/reports/balance-sheet",
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
    balance: Number(row.amount ?? row.balance ?? row.endingBalance ?? 0),
  }));
const group = (key, totalKey) =>
  computed(() => {
    const source = reportData.value[key] ?? [];
    const items = normalize(source);
    return {
      items,
      total:
        Number(reportData.value[totalKey] ?? source?.total ?? 0) ||
        items.reduce((sum, row) => sum + row.balance, 0),
    };
  });
const assets = group("assets", "totalAssets");
const liabilities = group("liabilities", "totalLiabilities");
const equity = group("equity", "totalEquity");
const netIncome = computed(() =>
  Number(reportData.value.unclosedEarnings ?? reportData.value.netIncome ?? 0),
);
</script>
