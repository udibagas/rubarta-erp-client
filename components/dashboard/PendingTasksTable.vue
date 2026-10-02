<template>
  <el-card shadow="never" body-class="p-2!">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-gray-900">Pending tasks</h2>
          <p class="text-sm text-gray-500">Work that needs attention</p>
        </div>

        <div class="flex items-center gap-2">
          <el-tag type="danger" effect="plain">
            {{ pendingTasks.length }} open
          </el-tag>
          <el-button size="small" :icon="ElIconRefresh" @click="refetch">
            Refresh
          </el-button>
        </div>
      </div>
    </template>

    <el-table :data="pendingTasks" v-loading="isPending" stripe>
      <template #empty>
        <el-result
          icon="success"
          title="All caught up"
          sub-title="You have no pending tasks"
        />
      </template>
      <el-table-column prop="task" label="Task" min-width="190" />
      <el-table-column prop="assignee" label="Assignee" min-width="120">
        <template #default="{ row }">
          <div class="line-clamp-1">{{ row.assignee }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="dueDate" label="Due date" width="115" />
      <el-table-column label="Priority" width="105" align="center">
        <template #default="{ row }">
          <el-tag
            :type="priorityType[row.priority]"
            effect="plain"
            size="small"
          >
            {{ row.priority }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Status" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <StatusTag :status="row.status" style="width: 100%" effect="plain">
            <template #icon>
              <el-icon>
                <ElIconCircleCheck v-if="row.status === 'Completed'" />
                <ElIconLoading v-else-if="row.status === 'InProgress'" />
                <ElIconWarning v-else-if="row.status === 'OnHold'" />
                <ElIconCircleClose v-else-if="row.status === 'Cancelled'" />
                <ElIconClock v-else />
              </el-icon>
            </template>
          </StatusTag>
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
  data: taskResponse,
  isPending,
  refetch,
} = useQuery({
  queryKey: ["dashboard-pending-tasks"],
  queryFn: () =>
    request("/api/tasks", {
      params: {
        page: 1,
        pageSize: 20,
        status: ["Todo", "InProgress", "OnHold"],
      },
    }),
});

const pendingTasks = computed(() =>
  rowsFrom(taskResponse.value)
    .filter((task) => ["Todo", "InProgress", "OnHold"].includes(task.status))
    .slice(0, 5)
    .map((task) => ({
      task: task.title || "-",
      assignee: task.User?.name || "-",
      dueDate: formatDate(task.dueDate),
      priority: task.priority || "Normal",
      status: task.status || "Todo",
    })),
);

const priorityType = {
  High: "danger",
  Normal: "warning",
  Low: "info",
};
</script>
