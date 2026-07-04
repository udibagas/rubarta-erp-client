<template>
  <div class="mb-4 flex justify-between items-center">
    <el-input
      v-model="keyword"
      placeholder="Search tasks..."
      style="width: 300px"
      :prefix-icon="ElIconSearch"
      :clearable="true"
    />
    <el-button type="success" :icon="ElIconPlus" @click="handleNewTask">
      New Task
    </el-button>
  </div>

  <el-table :data="data" stripe v-loading="isPending">
    <el-table-column type="index" label="#" width="60" />
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
          <div class="font-semibold text-sm">
            {{ dayjs(row.dueDate).fromNow() }}
          </div>
          <div class="text-xs text-gray-500">{{ formatDate(row.dueDate) }}</div>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Assigned To" prop="User.name" width="150" />
    <el-table-column label="Last Update" width="140">
      <template #default="{ row }">
        <div>
          <div class="font-semibold text-sm">
            {{ dayjs(row.updatedAt).fromNow() }}
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(row.updatedAt) }}
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column width="60" align="center" fixed="right">
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

// Local form state to avoid conflicts with global form store
const showTaskForm = ref(false);
const taskFormData = ref({});
const keyword = ref("");

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
</script>
