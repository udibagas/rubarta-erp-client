<template>
  <el-card
    class="rounded-xl border border-gray-100 shadow-sm h-full"
    shadow="hover"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-amber-50 rounded-lg text-amber-600">
            <Trophy :size="18" />
          </div>
          <div>
            <div class="font-semibold text-gray-800 text-base">
              Invoice Status Overview
            </div>
            <div class="text-xs text-gray-500">
              Invoice count and value grouped by payment status
            </div>
          </div>
        </div>

        <el-tag size="small" type="warning" effect="plain" class="rounded-full">
          {{ totalInvoices }} Invoices
        </el-tag>
      </div>
    </template>

    <div v-if="!statuses.length" class="py-8 text-center text-sm text-gray-400">
      No invoice data available
    </div>

    <div v-else class="space-y-3.5">
      <div
        v-for="status in statuses"
        :key="status.status"
        class="p-3 rounded-lg border border-gray-100 hover:border-amber-200 transition-colors"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2.5">
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :style="{ backgroundColor: status.color }"
            ></span>
            <div>
              <span class="text-xs font-semibold text-gray-800">{{
                status.status
              }}</span>
              <div class="text-[11px] text-gray-400">
                {{ status.count }} Invoice{{ status.count === 1 ? "" : "s" }}
              </div>
            </div>
          </div>

          <div class="text-right">
            <div class="text-xs font-bold text-gray-900">
              {{ status.formattedAmount }}
            </div>
            <div class="text-[11px] font-semibold text-gray-500">
              {{ status.percent }}% of total
            </div>
          </div>
        </div>

        <el-progress
          :percentage="status.percent"
          :stroke-width="8"
          :show-text="false"
          :color="status.color"
        />
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Trophy } from "lucide-vue-next";
import { toRupiah } from "@/utils/number";
import type { SalesDashboardData } from "@/types/salesDashboard.types";

const props = defineProps<{
  data?: SalesDashboardData | null;
}>();

const palette = ["#019932", "#409EFF", "#f59e0b", "#ef4444", "#8b5cf6"];

const totalInvoices = computed(() => props.data?.totals?.invoices?.count ?? 0);

const statuses = computed(() => {
  const items = props.data?.statusBreakdown?.invoices ?? [];
  const total = totalInvoices.value || 1;

  return items.map((item, index) => ({
    status: item.status,
    count: item.count,
    formattedAmount: toRupiah(String(item.amount)),
    percent: Math.round((item.count / total) * 100),
    color: palette[index % palette.length],
  }));
});
</script>
