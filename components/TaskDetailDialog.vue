<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Task Details"
    width="900px"
    :close-on-click-modal="false"
  >
    <div v-if="taskData && !isLoading">
      <div class="flex justify-end mb-4">
        <el-dropdown trigger="click">
          <el-button type="primary" :icon="ElIconMore"> Actions </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="ElIconEdit" @click="handleEdit">
                Edit Task
              </el-dropdown-item>
              <el-dropdown-item
                v-if="taskData.status !== 'Completed'"
                :icon="ElIconCheck"
                @click="markAsCompleted"
              >
                Mark as Completed
              </el-dropdown-item>
              <el-dropdown-item
                v-if="
                  taskData.status === 'Todo' || taskData.status === 'InProgress'
                "
                :icon="ElIconVideoPlay"
                @click="markAsInProgress"
              >
                Mark as In Progress
              </el-dropdown-item>
              <el-dropdown-item
                v-if="
                  taskData.status !== 'Cancelled' &&
                  taskData.status !== 'Completed'
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

      <el-descriptions :border="true" :column="2" direction="horizontal">
        <el-descriptions-item label="Title" :span="2">
          <strong class="text-lg">{{ taskData.title }}</strong>
        </el-descriptions-item>

        <el-descriptions-item
          label="Description"
          :span="2"
          v-if="taskData.description"
        >
          {{ taskData.description }}
        </el-descriptions-item>

        <el-descriptions-item label="Status">
          <StatusTag :status="taskData.status" effect="dark">
            <template #icon>
              <el-icon>
                <ElIconCircleCheck v-if="taskData.status === 'Completed'" />
                <ElIconLoading v-else-if="taskData.status === 'InProgress'" />
                <ElIconWarning v-else-if="taskData.status === 'OnHold'" />
                <ElIconCircleClose
                  v-else-if="taskData.status === 'Cancelled'"
                />
                <ElIconClock v-else />
              </el-icon>
            </template>
          </StatusTag>
        </el-descriptions-item>

        <el-descriptions-item label="Priority">
          <el-tag
            :type="
              taskData.priority === 'Urgent'
                ? 'danger'
                : taskData.priority === 'High'
                  ? 'warning'
                  : 'info'
            "
          >
            {{ taskData.priority }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="Assigned To">
          <div style="display: flex; align-items: center; gap: 10px">
            <el-avatar
              :size="32"
              :style="{
                backgroundColor: getAvatarColor(taskData.User?.name),
              }"
            >
              {{ taskData.User?.name?.charAt(0) }}
            </el-avatar>
            <span>{{ taskData.User?.name || "-" }}</span>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="Due Date">
          <div>
            <div class="font-semibold">
              {{ dayjs(taskData.dueDate).fromNow() }}
            </div>
            <div class="text-xs text-gray-500">
              {{ formatDateLong(taskData.dueDate) }}
            </div>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="Lead" v-if="taskData.Lead">
          <a
            class="text-green-500 hover:underline cursor-pointer"
            @click="navigateTo(`/crm/leads/${taskData.leadId}`)"
          >
            {{ taskData.Lead.title || taskData.Lead.Customer?.name }}
          </a>
        </el-descriptions-item>

        <el-descriptions-item label="Opportunity" v-if="taskData.Opportunity">
          <a
            class="text-green-500 hover:underline cursor-pointer"
            @click="navigateTo(`/crm/opportunities/${taskData.opportunityId}`)"
          >
            {{ taskData.Opportunity.name }}
          </a>
        </el-descriptions-item>

        <el-descriptions-item label="Customer" v-if="taskData.Customer">
          <el-link
            :underline="false"
            @click="navigateTo(`/crm/customers/${taskData.customerId}`)"
          >
            {{ taskData.Customer.name }}
          </el-link>
        </el-descriptions-item>

        <el-descriptions-item label="Created At">
          <div>
            <div class="font-semibold">
              {{ dayjs(taskData.createdAt).fromNow() }}
            </div>
            <div class="text-xs text-gray-500">
              {{ formatDateLong(taskData.createdAt) }}
              {{ formatTime(taskData.createdAt) }}
            </div>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="Updated At">
          <div>
            <div class="font-semibold">
              {{ dayjs(taskData.updatedAt).fromNow() }}
            </div>
            <div class="text-xs text-gray-500">
              {{ formatDateLong(taskData.updatedAt) }}
              {{ formatTime(taskData.updatedAt) }}
            </div>
          </div>
        </el-descriptions-item>

        <el-descriptions-item
          label="Attachments"
          v-if="taskData.attachments && taskData.attachments.length"
          :span="2"
        >
          <ul>
            <li v-for="file in taskData.attachments" :key="file.filePath">
              <el-link
                type="primary"
                :href="`${config.public.apiBase}/${file.filePath}`"
                target="_blank"
              >
                <el-icon><ElIconDocument /></el-icon> &nbsp;
                {{ file.fileName }}
              </el-link>
            </li>
          </ul>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div v-else-if="isLoading" v-loading="true" style="min-height: 200px"></div>

    <template #footer>
      <el-button
        @click="$emit('update:modelValue', false)"
        :icon="ElIconCircleClose"
      >
        Close
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getAvatarColor } from "~/utils/avatar";

dayjs.extend(relativeTime);

const config = useRuntimeConfig();

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  taskId: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "task-updated", "edit-task"]);

const request = useRequest();
const taskData = ref(null);
const isLoading = ref(false);

// Fetch task details when dialog opens
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && props.taskId) {
      isLoading.value = true;
      try {
        const data = await request(`/api/tasks/${props.taskId}`);
        taskData.value = data;
      } catch (error) {
        ElMessage.error("Failed to load task details");
        emit("update:modelValue", false);
      } finally {
        isLoading.value = false;
      }
    } else if (!isOpen) {
      // Clear data when dialog closes
      taskData.value = null;
    }
  },
  { immediate: true },
);

// Handle edit action
const handleEdit = () => {
  if (taskData.value) {
    emit("edit-task", taskData.value);
    emit("update:modelValue", false);
  }
};

// Update task status
const updateTaskStatus = async (status, successMessage) => {
  if (!taskData.value) return;

  try {
    await request(`/api/tasks/${taskData.value.id}`, {
      method: "PATCH",
      body: { status },
    });

    ElMessage.success(successMessage);

    // Refresh the task detail
    const updatedTask = await request(`/api/tasks/${taskData.value.id}`);
    taskData.value = updatedTask;

    // Emit event to refresh parent list
    emit("task-updated");
  } catch (error) {
    ElMessage.error("Failed to update task status");
  }
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
