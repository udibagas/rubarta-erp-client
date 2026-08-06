<template>
  <el-card class="rounded-xl h-full" shadow="hover">
    <template #header>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 font-semibold">
          <Activity :size="18" class="text-green-600" />
          <span>Recent Activities</span>
        </div>
        <!-- <el-button text size="small">
          View All
          <ArrowRight :size="14" />
        </el-button> -->
      </div>
    </template>
    <el-timeline>
      <el-timeline-item
        v-for="(activity, index) in recentActivities"
        :key="index"
        :timestamp="formatDate(activity.date)"
        placement="top"
        :color="getActivityColor(activity.type)"
      >
        <div class="py-2">
          <div class="font-semibold text-gray-800 mb-1">
            {{ activity.type }}
          </div>
          <div class="text-gray-500 text-sm mb-1">
            {{ activity.description }}
          </div>
          <div class="text-gray-400 text-xs flex items-center gap-2">
            <span v-if="activity.customerName">
              {{ activity.customerName }} &bull;
            </span>
            <span>{{ activity.userName }}</span>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script setup lang="ts">
import { ArrowRight, Activity } from "lucide-vue-next";
const { useQuery } = await import("@tanstack/vue-query");
const request = useRequest();

interface Activity {
  type: string; // Lead, Interaction, Opportunity, etc.
  description: string;
  customerId: number;
  customerName: string;
  userId: number;
  userName: string;
  date: string; // ISO date string
}

const { data: recentActivities } = useQuery<Activity[]>({
  queryKey: ["recent-activities"],
  queryFn: () => request("/api/crm-dashboard/recent-activities?limit=5"),
  refetchOnWindowFocus: false,
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

const getActivityColor = (type: string) => {
  const colorMap: Record<string, string> = {
    Lead: "#409EFF",
    Interaction: "#67C23A",
    Opportunity: "#E6A23C",
    Quotation: "#F56C6C",
    Order: "#909399",
    Task: "#019932",
  };
  return colorMap[type] || "#409EFF";
};
</script>
