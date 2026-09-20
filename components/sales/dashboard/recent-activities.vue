<template>
  <el-card
    class="rounded-xl border border-gray-100 shadow-sm h-full"
    shadow="hover"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Activity :size="18" />
          </div>
          <div>
            <div class="font-semibold text-gray-800 text-base">
              Recent Sales Activities
            </div>
            <div class="text-xs text-gray-500">
              Real-time feed of quotations, orders, deliveries & invoices
            </div>
          </div>
        </div>

        <el-select
          v-model="selectedType"
          size="small"
          placeholder="Filter Type"
          style="width: 150px"
        >
          <el-option label="All Types" value="ALL" />
          <el-option
            v-for="type in typeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </div>
    </template>

    <div
      v-if="!filteredActivities.length"
      class="py-8 text-center text-sm text-gray-400"
    >
      No recent activity
    </div>

    <div v-else class="flow-root">
      <ul role="list" class="-mb-8">
        <li
          v-for="(act, actIdx) in filteredActivities"
          :key="`${act.type}-${act.id}`"
          class="relative pb-6"
        >
          <span
            v-if="actIdx !== filteredActivities.length - 1"
            class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100"
            aria-hidden="true"
          ></span>
          <div class="relative flex items-start space-x-3">
            <div>
              <span
                class="h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm"
                :style="{ backgroundColor: act.meta.color }"
              >
                <component
                  :is="act.meta.icon"
                  class="h-4 w-4 text-white"
                  aria-hidden="true"
                />
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <div class="text-xs font-semibold text-gray-800">
                  <span
                    class="hover:text-emerald-600 transition-colors cursor-pointer"
                    @click="handleAction(act)"
                  >
                    {{ act.meta.label }} {{ act.number }}
                  </span>
                </div>
                <div class="text-[11px] text-gray-400 whitespace-nowrap">
                  {{ dayjs(act.date).fromNow() }}
                </div>
              </div>

              <div class="mt-0.5 text-xs text-gray-600">
                Status: {{ act.status }}
              </div>

              <div
                v-if="act.amount != null"
                class="mt-1.5 flex items-center gap-2 flex-wrap text-[11px]"
              >
                <span
                  class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold font-mono"
                >
                  {{ toRupiah(String(act.amount)) }}
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Activity } from "lucide-vue-next";
import { toRupiah } from "@/utils/number";
import { documentTypeMeta, getDocumentTypeMeta } from "@/utils/documentType";
import type { SalesDashboardData } from "@/types/salesDashboard.types";

dayjs.extend(relativeTime);

const props = defineProps<{
  data?: SalesDashboardData | null;
}>();

const selectedType = ref("ALL");

const typeOptions = Object.entries(documentTypeMeta).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const activities = computed(
  () =>
    props.data?.recent?.map((item) => ({
      ...item,
      meta: getDocumentTypeMeta(item.type),
    })) ?? [],
);

const filteredActivities = computed(() => {
  if (selectedType.value === "ALL") return activities.value;
  return activities.value.filter((act) => act.type === selectedType.value);
});

const handleAction = (act: { meta: { route: string }; id: number }) => {
  navigateTo(`${act.meta.route}/${act.id}`);
};
</script>
