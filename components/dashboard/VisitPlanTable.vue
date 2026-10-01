<template>
  <el-card shadow="never" body-class="p-2!">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-gray-900">Visit plan</h2>
          <p class="text-sm text-gray-500">Upcoming customer visits</p>
        </div>

        <div class="flex items-center gap-2">
          <el-tag type="success" effect="plain">
            {{ visitPlans.length }} visits
          </el-tag>
          <el-button size="small" :icon="ElIconRefresh" @click="refetch">
            Refresh
          </el-button>
        </div>
      </div>
    </template>

    <el-table :data="visitPlans" v-loading="isPending" stripe>
      <template #empty>
        <el-result
          icon="success"
          title="All caught up"
          sub-title="You have no upcoming visits"
        />
      </template>
      <el-table-column prop="date" label="Date" width="125" />
      <el-table-column prop="time" label="Time" width="110" />
      <el-table-column prop="customer" label="Customer" width="180">
        <template #default="{ row }">
          <div class="font-semibold line-clamp-1">{{ row.customer }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="owner" label="User" width="180">
        <template #default="{ row }">
          <div class="line-clamp-1">{{ row.owner }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="purpose" label="Purpose" min-width="190">
        <template #default="{ row }">
          <div class="line-clamp-1">{{ row.purpose }}</div>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";

const request = useRequest();

const rowsFrom = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return response?.items ?? [];
};

const {
  data: visitPlanResponse,
  isPending,
  refetch,
} = useQuery({
  queryKey: ["dashboard-visit-plans"],
  queryFn: () =>
    request("/api/visit-plans", {
      params: { page: 1, pageSize: 5, status: ["Planned"], upcoming: true },
    }),
});

const visitPlans = computed(() =>
  rowsFrom(visitPlanResponse.value).map((visit) => ({
    date: formatDate(visit.scheduledDate),
    time: visit.scheduledTime || formatTime(visit.scheduledDate),
    customer: visit.Customer?.name || "-",
    purpose: visit.purpose || visit.title || "-",
    owner: visit.User?.name || "-",
    status: visit.status || "-",
  })),
);
</script>
