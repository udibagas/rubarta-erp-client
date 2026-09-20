<template>
  <el-card
    class="rounded-xl border border-gray-100 shadow-sm h-full"
    shadow="hover"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-purple-50 rounded-lg text-purple-600">
            <Package :size="18" />
          </div>
          <div>
            <div class="font-semibold text-gray-800 text-base">
              Quotation Status Breakdown
            </div>
            <div class="text-xs text-gray-500">
              Quotation value ranked by current status
            </div>
          </div>
        </div>

        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="amount">Amount</el-radio-button>
          <el-radio-button value="count">Docs</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <div
      v-if="!rankedStatuses.length"
      class="py-8 text-center text-sm text-gray-400"
    >
      No quotation data available
    </div>

    <div v-else class="space-y-3.5">
      <div
        v-for="(item, index) in rankedStatuses"
        :key="item.status"
        class="group p-2.5 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-200"
      >
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <div class="flex items-center gap-2.5 min-w-0">
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              :class="
                index === 0
                  ? 'bg-amber-100 text-amber-700'
                  : index === 1
                    ? 'bg-slate-200 text-slate-700'
                    : index === 2
                      ? 'bg-amber-700/10 text-amber-900'
                      : 'bg-gray-100 text-gray-500'
              "
            >
              {{ index + 1 }}
            </span>
            <div class="min-w-0">
              <div
                class="text-xs font-semibold text-gray-800 truncate group-hover:text-emerald-700"
              >
                {{ item.status }}
              </div>
              <div class="text-[11px] text-gray-400">
                {{ item.count }} Quotation{{ item.count === 1 ? "" : "s" }}
              </div>
            </div>
          </div>

          <div class="text-right shrink-0">
            <div class="text-xs font-bold text-gray-800">
              {{
                viewMode === "amount"
                  ? item.formattedAmount
                  : `${item.count} Docs`
              }}
            </div>
          </div>
        </div>

        <!-- Progress bar of share -->
        <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            class="h-full rounded-full bg-emerald-500 transition-all duration-500"
            :style="{ width: `${item.share}%` }"
          ></div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Package } from "lucide-vue-next";
import { toRupiah } from "@/utils/number";
import type { SalesDashboardData } from "@/types/salesDashboard.types";

const props = defineProps<{
  data?: SalesDashboardData | null;
}>();

const viewMode = ref<"amount" | "count">("amount");

const rankedStatuses = computed(() => {
  const items = props.data?.statusBreakdown?.quotations ?? [];
  const maxValue = Math.max(
    ...items.map((item) =>
      viewMode.value === "amount" ? item.amount : item.count,
    ),
    1,
  );

  return [...items]
    .sort((a, b) =>
      viewMode.value === "amount" ? b.amount - a.amount : b.count - a.count,
    )
    .map((item) => ({
      status: item.status,
      count: item.count,
      formattedAmount: toRupiah(String(item.amount)),
      share:
        ((viewMode.value === "amount" ? item.amount : item.count) / maxValue) *
        100,
    }));
});
</script>
