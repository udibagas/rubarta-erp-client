<template>
  <el-card class="rounded-xl h-full" shadow="hover">
    <template #header>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 font-semibold">
          <Activity :size="18" class="text-green-600" />
          <span>Recent Activities</span>
        </div>
        <el-button text size="small" @click="viewAllActivities">
          View All
          <ArrowRight :size="14" />
        </el-button>
      </div>
    </template>
    <el-timeline>
      <el-timeline-item
        v-for="activity in recentActivities"
        :key="activity.id"
        :timestamp="activity.timestamp"
        placement="top"
        :color="activity.color"
      >
        <div class="py-2">
          <div class="font-semibold text-gray-800 mb-1">
            {{ activity.title }}
          </div>
          <div class="text-gray-500 text-sm mb-1">
            {{ activity.description }}
          </div>
          <div class="text-gray-400 text-xs">{{ activity.user }}</div>
        </div>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script setup>
import { ref } from "vue";
import { ArrowRight, Activity } from "lucide-vue-next";
// Recent Activities
const recentActivities = ref([
  {
    id: 1,
    title: "New lead created",
    description: "ABC Corp - Enterprise software inquiry",
    user: "John Smith",
    timestamp: "2 hours ago",
    color: "#019932",
  },
  {
    id: 2,
    title: "Deal closed",
    description: "XYZ Ltd - $50,000 annual contract",
    user: "Sarah Johnson",
    timestamp: "4 hours ago",
    color: "#409EFF",
  },
  {
    id: 3,
    title: "Meeting scheduled",
    description: "Demo with Tech Solutions Inc",
    user: "Mike Wilson",
    timestamp: "6 hours ago",
    color: "#E6A23C",
  },
  {
    id: 4,
    title: "Follow-up completed",
    description: "Proposal sent to Global Systems",
    user: "Lisa Davis",
    timestamp: "1 day ago",
    color: "#909399",
  },
]);

const viewAllActivities = () => {
  navigateTo("/crm/interactions");
};
</script>
