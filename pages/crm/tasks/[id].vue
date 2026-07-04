<template>
  <el-page-header
    @back="goBack"
    :content="`CRM / Tasks / ${task?.title || ''}`"
  >
    <template #extra>
      <div class="flex gap-2">
        <el-button :icon="ElIconRefresh" @click="refetch" v-if="task" />
        <el-dropdown v-if="task" trigger="click">
          <el-button type="primary" :icon="ElIconMore"> Actions </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="ElIconEdit" @click="openEditForm">
                Edit Task
              </el-dropdown-item>
              <el-dropdown-item
                v-if="task.status !== 'Completed'"
                :icon="ElIconCheck"
                @click="markAsCompleted"
              >
                Mark as Completed
              </el-dropdown-item>
              <el-dropdown-item
                v-if="task.status === 'Todo' || task.status === 'InProgress'"
                :icon="ElIconVideoPlay"
                @click="markAsInProgress"
              >
                Mark as In Progress
              </el-dropdown-item>
              <el-dropdown-item
                v-if="
                  task.status !== 'Cancelled' && task.status !== 'Completed'
                "
                :icon="ElIconClose"
                @click="markAsCancelled"
              >
                Cancel Task
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
  </el-page-header>

  <br />

  <el-descriptions
    v-if="task"
    :border="true"
    :column="2"
    direction="horizontal"
  >
    <el-descriptions-item label="Title" :span="2">
      <strong class="text-lg">{{ task.title }}</strong>
    </el-descriptions-item>

    <el-descriptions-item label="Description" :span="2" v-if="task.description">
      {{ task.description }}
    </el-descriptions-item>

    <el-descriptions-item label="Status">
      <StatusTag :status="task.status" effect="dark">
        <template #icon>
          <el-icon>
            <ElIconCircleCheck v-if="task.status === 'Completed'" />
            <ElIconLoading v-else-if="task.status === 'InProgress'" />
            <ElIconWarning v-else-if="task.status === 'OnHold'" />
            <ElIconCircleClose v-else-if="task.status === 'Cancelled'" />
            <ElIconClock v-else />
          </el-icon>
        </template>
      </StatusTag>
    </el-descriptions-item>

    <el-descriptions-item label="Priority">
      <el-tag
        :type="
          task.priority === 'Urgent'
            ? 'danger'
            : task.priority === 'High'
              ? 'warning'
              : 'info'
        "
      >
        {{ task.priority }}
      </el-tag>
    </el-descriptions-item>

    <el-descriptions-item label="Assigned To">
      <div style="display: flex; align-items: center; gap: 10px">
        <el-avatar
          :size="32"
          :style="{ backgroundColor: getAvatarColor(task.User?.name) }"
        >
          {{ task.User?.name?.charAt(0) }}
        </el-avatar>
        <span>{{ task.User?.name || "-" }}</span>
      </div>
    </el-descriptions-item>

    <el-descriptions-item label="Due Date">
      <div>
        <div class="font-semibold">{{ dayjs(task.dueDate).fromNow() }}</div>
        <div class="text-xs text-gray-500">
          {{ formatDateLong(task.dueDate) }}
        </div>
      </div>
    </el-descriptions-item>

    <el-descriptions-item label="Lead" v-if="task.Lead">
      <a
        class="text-green-500 hover:underline cursor-pointer"
        @click="navigateTo(`/crm/leads/${task.leadId}`)"
      >
        {{ task.Lead.title || task.Lead.Customer?.name }}
      </a>
    </el-descriptions-item>

    <el-descriptions-item label="Opportunity" v-if="task.Opportunity">
      <a
        class="text-green-500 hover:underline cursor-pointer"
        @click="navigateTo(`/crm/opportunities/${task.opportunityId}`)"
      >
        {{ task.Opportunity.name }}
      </a>
    </el-descriptions-item>

    <el-descriptions-item label="Customer" v-if="task.Customer">
      <a
        class="text-green-500 hover:underline cursor-pointer"
        @click="navigateTo(`/crm/customers/${task.customerId}`)"
      >
        {{ task.Customer.name }}
      </a>
    </el-descriptions-item>

    <el-descriptions-item label="Created At">
      <div>
        <div class="font-semibold">{{ dayjs(task.createdAt).fromNow() }}</div>
        <div class="text-xs text-gray-500">
          {{ formatDateLong(task.createdAt) }} {{ formatTime(task.createdAt) }}
        </div>
      </div>
    </el-descriptions-item>

    <el-descriptions-item label="Updated At">
      <div>
        <div class="font-semibold">{{ dayjs(task.updatedAt).fromNow() }}</div>
        <div class="text-xs text-gray-500">
          {{ formatDateLong(task.updatedAt) }} {{ formatTime(task.updatedAt) }}
        </div>
      </div>
    </el-descriptions-item>
  </el-descriptions>

  <TaskForm />
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getAvatarColor } from "~/utils/avatar";

dayjs.extend(relativeTime);

const route = useRoute();
const request = useRequest();
const queryClient = useQueryClient();
const taskId = computed(() => route.params.id);

// Fetch task data
const {
  data: task,
  isPending: isLoading,
  refetch,
} = useQuery({
  queryKey: ["task", taskId],
  queryFn: async () => {
    return await request(`/api/tasks/${taskId.value}`);
  },
  enabled: computed(() => !!taskId.value),
});

// Form handling
const { openForm } = useCrud({
  url: "/api/tasks",
  queryKey: "tasks",
});

const openEditForm = () => {
  if (task.value) {
    openForm(task.value);
  }
};

const goBack = () => {
  navigateTo("/crm/tasks");
};

// Update task status
const updateTaskStatus = (status, successMessage) => {
  return request(`/api/tasks/${taskId.value}`, {
    method: "PATCH",
    body: { status },
  })
    .then(() => {
      ElMessage.success(successMessage);
      refetch();
      queryClient.invalidateQueries(["tasks"]);
    })
    .catch((error) => {
      ElMessage.error("Failed to update task status");
    });
};

// Mark as completed
const markAsCompleted = () => {
  ElMessageBox.confirm("Mark this task as completed?", "Confirm", {
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    type: "success",
  })
    .then(() => {
      updateTaskStatus("Completed", "Task marked as completed!");
    })
    .catch(() => {});
};

// Mark as in progress
const markAsInProgress = () => {
  updateTaskStatus("InProgress", "Task marked as in progress!");
};

// Mark as cancelled
const markAsCancelled = () => {
  ElMessageBox.confirm(
    "Are you sure you want to cancel this task?",
    "Warning",
    {
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      type: "warning",
    },
  )
    .then(() => {
      updateTaskStatus("Cancelled", "Task cancelled");
    })
    .catch(() => {});
};
</script>
