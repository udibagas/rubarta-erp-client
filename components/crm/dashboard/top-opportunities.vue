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
          </el-select>
          <el-button text size="small" @click="viewAllOpportunities">
            View All
            <ArrowRight :size="14" />
          </el-button>
        </div>
      </div>
    </template>
    <el-table :data="sortedOpportunities" style="width: 100%" size="small">
      <el-table-column prop="name" label="Opportunity" min-width="120">
        <template #default="{ row }">
          <div>
            <div class="font-semibold text-gray-800 text-sm">
              {{ row.name }}
            </div>
            <div class="text-gray-500 text-xs">{{ row.company }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="value" label="Value" align="right">
        <template #default="{ row }">
          <span class="font-semibold text-emerald-600"
            >${{ formatNumber(row.value) }}</span
          >
        </template>
      </el-table-column>
      <el-table-column prop="stage" label="Stage">
        <template #default="{ row }">
          <el-tag :type="getStageType(row.stage)" size="small">
            {{ row.stage }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="probability" label="Probability" align="center">
        <template #default="{ row }">
          <el-progress
            :percentage="row.probability"
            :color="getProgressColor(row.probability)"
            :stroke-width="8"
            :show-text="false"
          />
          <span class="text-xs text-gray-500 ml-2">{{ row.probability }}%</span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  ArrowRight,
  Briefcase,
  Flame,
  Calendar,
  TrendingUp,
  Clock,
} from "lucide-vue-next";

// Sort options
const sortOption = ref("probability");
const sortOptions = [
  { value: "probability", label: "Hot Deals", icon: Flame },
  { value: "close_date", label: "Upcoming", icon: Calendar },
  { value: "amount", label: "Big Wins", icon: TrendingUp },
  { value: "recent", label: "Recent", icon: Clock },
];

// Top Opportunities
const topOpportunities = ref([
  {
    id: 1,
    name: "Enterprise CRM System",
    company: "TechCorp Ltd",
    value: 150000,
    stage: "Proposal",
    probability: 75,
    expected_close_date: "2026-09-15",
    created_at: "2026-06-10",
  },
  {
    id: 2,
    name: "Cloud Migration Project",
    company: "Global Systems",
    value: 250000,
    stage: "Negotiation",
    probability: 85,
    expected_close_date: "2026-08-20",
    created_at: "2026-05-15",
  },
  {
    id: 3,
    name: "Digital Transformation",
    company: "Innovation Inc",
    value: 180000,
    stage: "Qualification",
    probability: 45,
    expected_close_date: "2026-10-30",
    created_at: "2026-07-01",
  },
  {
    id: 4,
    name: "Software Licensing",
    company: "Business Solutions",
    value: 95000,
    stage: "Proposal",
    probability: 60,
    expected_close_date: "2026-09-05",
    created_at: "2026-06-20",
  },
  {
    id: 5,
    name: "IT Consulting Services",
    company: "StartupX",
    value: 75000,
    stage: "Discovery",
    probability: 30,
    expected_close_date: "2026-11-10",
    created_at: "2026-07-15",
  },
]);

// Computed sorted opportunities
const sortedOpportunities = computed(() => {
  const opportunities = [...topOpportunities.value];

  switch (sortOption.value) {
    case "probability":
      // Hot Deals - sort by probability descending
      return opportunities.sort((a, b) => b.probability - a.probability);

    case "close_date":
      // Upcoming - sort by expected close date ascending
      return opportunities.sort(
        (a, b) =>
          new Date(a.expected_close_date) - new Date(b.expected_close_date),
      );

    case "amount":
      // Big Wins - sort by value descending
      return opportunities.sort((a, b) => b.value - a.value);

    case "recent":
      // Recent - sort by created date descending
      return opportunities.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

    default:
      return opportunities;
  }
});

function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

const getStageType = (stage) => {
  const types = {
    Discovery: "info",
    Qualification: "warning",
    Proposal: "primary",
    Negotiation: "success",
    "Closed Won": "success",
    "Closed Lost": "danger",
  };
  return types[stage] || "info";
};

const getProgressColor = (percentage) => {
  if (percentage >= 80) return "#67C23A";
  if (percentage >= 60) return "#019932";
  if (percentage >= 40) return "#E6A23C";
  return "#F56C6C";
};

const viewAllOpportunities = () => {
  navigateTo("/crm/opportunities");
};
</script>
