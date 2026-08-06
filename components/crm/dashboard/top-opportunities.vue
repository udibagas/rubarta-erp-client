<template>
  <el-card class="rounded-xl h-full" shadow="hover">
    <template #header>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 font-semibold">
          <Briefcase :size="18" class="text-green-600" />
          <span>Top Opportunities</span>
        </div>
        <div class="flex items-center gap-3">
          <el-select
            v-model="sortOption"
            placeholder="Sort by"
            size="small"
            style="width: 180px"
          >
            <el-option
              v-for="option in sortOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            >
              <div class="flex items-center gap-2">
                <component :is="option.icon" :size="14" />
                <span>{{ option.label }}</span>
              </div>
            </el-option>
            <template #prefix>
              <el-icon>
                <component
                  :is="
                    sortOptions.find((option) => option.value === sortOption)
                      ?.icon
                  "
                  :size="14"
                />
              </el-icon>
            </template>
          </el-select>
          <el-button
            text
            size="small"
            @click="navigateTo('/crm/opportunities')"
          >
            View All
            <ArrowRight :size="14" />
          </el-button>
        </div>
      </div>
    </template>

    <el-table :data="topOpportunities?.data ?? []">
      <el-table-column prop="name" label="Opportunity" min-width="150">
        <template #default="{ row }">
          <div>
            <div class="font-semibold text-gray-800 text-sm line-clamp-1">
              {{ row.name }}
            </div>
            <div class="text-gray-500 text-xs line-clamp-1">
              {{ row.Customer?.name ?? "-" }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="Value" align="center" width="200">
        <template #default="{ row }">
          <el-tag
            type="success"
            class="font-mono"
            effect="plain"
            style="width: 100%"
            size="large"
          >
            {{ toCurrency(row.amount) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="stage" label="Stage" width="150">
        <template #default="{ row }">
          <StatusTag :status="row.stage" style="width: 100%" effect="dark">
            <template #icon>
              <el-icon>
                <ElIconSearch v-if="row.stage === 'Prospecting'" />
                <ElIconSelect v-else-if="row.stage === 'Qualification'" />
                <ElIconEdit v-else-if="row.stage === 'Proposal'" />
                <ElIconChatDotRound v-else-if="row.stage === 'Negotiation'" />
                <ElIconDocument v-else-if="row.stage === 'Proposal_Sent'" />
                <ElIconTrophy v-else-if="row.stage === 'Closed_Won'" />
                <ElIconCircleClose v-else-if="row.stage === 'Closed_Lost'" />
              </el-icon>
            </template>
          </StatusTag>
        </template>
      </el-table-column>
      <el-table-column prop="probability" label="Probability" width="200">
        <template #default="{ row }">
          <el-progress
            :percentage="row.probability"
            :color="getProgressColor(row.probability)"
            :stroke-width="8"
          />
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import {
  ArrowRight,
  Briefcase,
  Flame,
  Calendar,
  TrendingUp,
  Clock,
} from "lucide-vue-next";
import { useQuery } from "@tanstack/vue-query";
const request = useRequest();

// Sort options
const sortOption = ref("probability");
const sortOptions = [
  { value: "probability", label: "Hot Deals", icon: Flame },
  { value: "expectedCloseDate", label: "Upcoming", icon: Calendar },
  { value: "amount", label: "Big Wins", icon: TrendingUp },
  { value: "createdAt", label: "Recent", icon: Clock },
];

const params = computed(() => ({
  page: 1,
  pageSize: 10,
  sortBy: sortOption.value,
  sortOrder: "desc",
}));

const { data: topOpportunities } = useQuery({
  queryKey: ["top-opportunities", params],
  queryFn: () => request("/api/opportunities", { params: params.value }),
  keepPreviousData: true,
  refetchOnWindowFocus: false,
});

const getProgressColor = (percentage) => {
  if (percentage >= 80) return "#67C23A";
  if (percentage >= 60) return "#019932";
  if (percentage >= 40) return "#E6A23C";
  return "#F56C6C";
};
</script>
