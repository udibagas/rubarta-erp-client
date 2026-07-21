<template>
  <!-- Summary Cards -->
  <div class="grid grid-cols-4 gap-4 mb-6">
    <el-card shadow="hover" class="summary-card">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-gray-500 text-sm mb-1">Total Tasks</div>
          <div class="text-2xl font-bold">{{ totalTasks }}</div>
        </div>
        <el-icon :size="40" class="text-blue-500">
          <ElIconDocument />
        </el-icon>
      </div>
    </el-card>

    <el-card shadow="hover" class="summary-card">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-gray-500 text-sm mb-1">Pending Tasks</div>
          <div class="text-2xl font-bold text-orange-500">
            {{ pendingTasks }}
          </div>
        </div>
        <el-icon :size="40" class="text-orange-500">
          <ElIconClock />
        </el-icon>
      </div>
    </el-card>

    <el-card shadow="hover" class="summary-card">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-gray-500 text-sm mb-1">Completed Tasks</div>
          <div class="text-2xl font-bold text-green-500">
            {{ completedTasks }}
          </div>
        </div>
        <el-icon :size="40" class="text-green-500">
          <ElIconCircleCheck />
        </el-icon>
      </div>
    </el-card>

    <el-card shadow="hover" class="summary-card">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <div class="text-gray-500 text-sm mb-2">Completion Rate</div>
          <el-progress
            :percentage="completionRate"
            :color="
              completionRate >= 75
                ? '#67c23a'
                : completionRate >= 50
                  ? '#e6a23c'
                  : '#f56c6c'
            "
          />
        </div>
      </div>
    </el-card>
  </div>

  <div class="mb-4 flex justify-between items-center">
    <div class="flex gap-2 items-center">
      <el-radio-group v-model="viewMode" size="default">
        <el-radio-button value="table">
          <el-icon><ElIconList /></el-icon>
          Table
        </el-radio-button>
        <el-radio-button value="kanban">
          <el-icon><ElIconMenu /></el-icon>
          Kanban
        </el-radio-button>
      </el-radio-group>

      <el-input
        v-if="viewMode === 'table'"
        v-model="keyword"
        placeholder="Search tasks..."
        style="width: 300px"
        :prefix-icon="ElIconSearch"
        :clearable="true"
      />
    </div>
    <el-button type="success" :icon="ElIconPlus" @click="handleNewTask">
      New Task
    </el-button>
  </div>

  <!-- Table View -->
  <el-table
    v-if="viewMode === 'table'"
    :data="data"
    stripe
    v-loading="isPending"
  >
    <el-table-column label="Title" min-width="200">
      <template #default="{ row }">
        <div>
          <strong>{{ row.title }}</strong>
        </div>
        <div v-if="row.description" class="text-sm text-gray-500">
          {{ row.description }}
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Status" width="140" align="center">
      <template #default="{ row }">
        <StatusTag :status="row.status">
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
    <el-table-column label="Priority" width="100" align="center">
      <template #default="{ row }">
        <el-tag
          :type="
            row.priority === 'Urgent'
              ? 'danger'
              : row.priority === 'High'
                ? 'warning'
                : 'info'
          "
        >
          {{ row.priority }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="Due Date" width="140">
      <template #default="{ row }">
        <div>
          <div
            class="font-semibold text-sm"
            :class="{
              'text-red-500':
                (row.status === 'Todo' || row.status === 'InProgress') &&
                dayjs(row.dueDate).isBefore(dayjs(), 'day'),
            }"
          >
            {{ dayjs(row.dueDate).fromNow() }}
            <el-icon
              v-if="
                (row.status === 'Todo' || row.status === 'InProgress') &&
                dayjs(row.dueDate).isBefore(dayjs(), 'day')
              "
              class="text-red-500"
            >
              <ElIconWarning />
            </el-icon>
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(row.dueDate) }}
            <span
              v-if="
                (row.status === 'Todo' || row.status === 'InProgress') &&
                dayjs(row.dueDate).isBefore(dayjs(), 'day')
              "
              class="text-red-500 font-semibold"
            >
              (Overdue)
            </span>
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Assigned To" width="180">
      <template #default="{ row }">
        <div v-if="row.User" class="flex items-center gap-2">
          <el-avatar
            :size="32"
            class="shrink-0"
            :style="{ backgroundColor: getAvatarColor(row.User.name) }"
          >
            {{ row.User.name?.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="font-semibold text-sm">{{ row.User.name }}</span>
        </div>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column label="Last Update" width="140">
      <template #default="{ row }">
        <div>
          <div class="font-semibold text-sm">
            {{ dayjs(row.updatedAt).fromNow() }}
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(row.updatedAt) }} {{ formatTime(row.updatedAt) }}
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column width="60" align="center" fixed="right">
      <template #header>
        <el-button
          type="text"
          size="small"
          :icon="ElIconRefresh"
          circle
          @click="queryClient.invalidateQueries({ queryKey: ['tasks'] })"
        />
      </template>
      <template #default="{ row }">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-icon>
              <ElIconMoreFilled />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="ElIconEdit" @click="handleEditTask(row)">
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.status !== 'InProgress'"
                :icon="ElIconLoading"
                @click="handleUpdateStatus(row.id, 'InProgress')"
              >
                Mark as In Progress
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.status !== 'Completed'"
                :icon="ElIconCircleCheck"
                @click="handleUpdateStatus(row.id, 'Completed')"
              >
                Mark as Completed
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.status !== 'OnHold'"
                :icon="ElIconWarning"
                @click="handleUpdateStatus(row.id, 'OnHold')"
              >
                Mark as On Hold
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconDelete"
                @click="handleDeleteTask(row.id)"
              >
                Delete
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>

  <!-- Kanban View -->
  <TaskKanbanView
    v-else-if="viewMode === 'kanban'"
    :data="data"
    :is-pending="isPending"
    @open-detail="openDetailDialog"
    @edit-task="handleEditTask"
    @delete-task="handleDeleteTask"
    @refresh="queryClient.invalidateQueries({ queryKey: ['tasks'] })"
  />

  <!-- Task Form Dialog -->
  <el-dialog
    v-model="showTaskForm"
    width="750px"
    :title="taskFormData.id ? 'EDIT TASK' : 'ADD TASK'"
    :close-on-click-modal="false"
    @close="taskFormData = {}"
  >
    <el-form label-width="140px" label-position="left">
      <el-form-item label="Title" required>
        <el-input placeholder="Task title" v-model="taskFormData.title" />
      </el-form-item>

      <el-form-item label="Description">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="Task description"
          v-model="taskFormData.description"
        />
      </el-form-item>

      <el-form-item label="Assigned To" required>
        <el-select
          v-model="taskFormData.userId"
          placeholder="Select user"
          filterable
        >
          <el-option
            v-for="user in users"
            :key="user.id"
            :value="user.id"
            :label="user.name"
          />
        </el-select>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Priority" required>
            <el-select
              v-model="taskFormData.priority"
              placeholder="Select priority"
            >
              <el-option
                v-for="priority in taskPriorities"
                :key="priority"
                :value="priority"
                :label="priority"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Status" required>
            <el-select
              v-model="taskFormData.status"
              placeholder="Select status"
            >
              <template #prefix>
                <el-icon>
                  <ElIconCircleCheck
                    v-if="taskFormData.status === 'Completed'"
                  />
                  <ElIconLoading
                    v-else-if="taskFormData.status === 'InProgress'"
                  />
                  <ElIconWarning v-else-if="taskFormData.status === 'OnHold'" />
                  <ElIconCircleClose
                    v-else-if="taskFormData.status === 'Cancelled'"
                  />
                  <ElIconClock v-else />
                </el-icon>
              </template>
              <el-option
                v-for="status in taskStatuses"
                :key="status"
                :value="status"
                :label="status"
              >
                <div style="display: flex; align-items: center; gap: 8px">
                  <el-icon>
                    <ElIconCircleCheck v-if="status === 'Completed'" />
                    <ElIconLoading v-else-if="status === 'InProgress'" />
                    <ElIconWarning v-else-if="status === 'OnHold'" />
                    <ElIconCircleClose v-else-if="status === 'Cancelled'" />
                    <ElIconClock v-else />
                  </el-icon>
                  <span>{{ status }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Due Date" required>
        <el-date-picker
          v-model="taskFormData.dueDate"
          type="date"
          placeholder="Due date"
          value-format="YYYY-MM-DDT00:00:00Z"
          format="DD-MMM-YYYY"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="showTaskForm = false"> CANCEL </el-button>
      <el-button type="success" @click="saveTask"> SAVE </el-button>
    </template>
  </el-dialog>

  <!-- Task Detail Dialog -->
  <TaskDetailDialog
    v-model="showDetailDialog"
    :task-id="selectedTaskId"
    @task-updated="queryClient.invalidateQueries({ queryKey: ['tasks'] })"
    @edit-task="handleEditTask"
  />
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { taskPriorities } from "~/constants/taskPriorities";
import { taskStatuses } from "~/constants/taskStatuses";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const props = defineProps({
  leadId: {
    type: [String, Number],
    required: false,
  },
  opportunityId: {
    type: [String, Number],
    required: false,
  },
});

const request = useRequest();
const queryClient = useQueryClient();

// View mode and dialog states
const viewMode = ref("table");
const showTaskForm = ref(false);
const taskFormData = ref({});
const keyword = ref("");
const showDetailDialog = ref(false);
const selectedTaskId = ref(null);

const handleNewTask = () => {
  const newTask = {
    priority: "Medium",
    status: "Todo",
  };

  if (props.leadId) {
    newTask.leadId = +props.leadId;
  }

  if (props.opportunityId) {
    newTask.opportunityId = +props.opportunityId;
  }

  taskFormData.value = newTask;
  showTaskForm.value = true;
};

const handleEditTask = (task) => {
  taskFormData.value = { ...task };
  showTaskForm.value = true;
};

// Open task detail dialog
const openDetailDialog = (task) => {
  selectedTaskId.value = task.id;
  showDetailDialog.value = true;
};

const handleDeleteTask = (id) => {
  ElMessageBox.confirm(
    "Are you sure you want to delete this task?",
    "Warning",
    {
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await request(`/api/tasks/${id}`, { method: "DELETE" });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        ElMessage({
          message: "Task deleted successfully",
          type: "success",
          showClose: true,
        });
      } catch (error) {
        ElMessage({
          message: error.message || "Failed to delete task",
          type: "error",
          showClose: true,
        });
      }
    })
    .catch(() => {});
};

const handleUpdateStatus = async (id, status) => {
  try {
    await request(`/api/tasks/${id}`, {
      method: "PATCH",
      body: { status },
    });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    ElMessage({
      message: `Task marked as ${status.replace(/([A-Z])/g, " $1").trim()}`,
      type: "success",
      showClose: true,
    });
  } catch (error) {
    ElMessage({
      message: error.message || "Failed to update task status",
      type: "error",
      showClose: true,
    });
  }
};

const saveTask = async () => {
  try {
    const data = taskFormData.value;
    if (data.id) {
      await request(`/api/tasks/${data.id}`, { method: "PATCH", body: data });
    } else {
      await request("/api/tasks", { method: "POST", body: data });
    }
    showTaskForm.value = false;
    taskFormData.value = {};
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    ElMessage({
      message: "Task saved successfully",
      type: "success",
      showClose: true,
    });
  } catch (error) {
    ElMessage({
      message: error.message || "Failed to save task",
      type: "error",
      showClose: true,
    });
  }
};

const { data, isPending } = useQuery({
  queryKey: ["tasks", props, keyword],
  queryFn: async () => {
    const params = new URLSearchParams();
    if (props.leadId) {
      params.append("leadId", props.leadId);
    }

    if (props.opportunityId) {
      params.append("opportunityId", props.opportunityId);
    }

    if (keyword.value) {
      params.append("keyword", keyword.value);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    return await request(`/api/tasks${query}`);
  },
  enabled: computed(() => !!(props.leadId || props.opportunityId)),
});

// Fetch users for the select dropdown
const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    return await request("/api/users");
  },
});

// Summary statistics
const totalTasks = computed(() => {
  return data.value?.length || 0;
});

const pendingTasks = computed(() => {
  if (!data.value) return 0;
  return data.value.filter(
    (task) => task.status === "Todo" || task.status === "InProgress",
  ).length;
});

const completedTasks = computed(() => {
  if (!data.value) return 0;
  return data.value.filter((task) => task.status === "Completed").length;
});

const completionRate = computed(() => {
  if (totalTasks.value === 0) return 0;
  return Math.round((completedTasks.value / totalTasks.value) * 100);
});
</script>

<style scoped>
.summary-card {
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-card :deep(.el-card__body) {
  padding: 20px;
}
</style>
