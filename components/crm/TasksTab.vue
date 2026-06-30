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
    <el-table-column label="Status" width="140">
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
    <el-table-column label="Priority" width="100">
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
    <el-table-column label="Due Date" width="120">
      <template #default="{ row }">
        {{ formatDate(row.dueDate) }}
      </template>
    </el-table-column>
    <el-table-column label="Assigned To" prop="User.name" width="150" />
    <el-table-column label="Last Update" width="150">
      <template #default="{ row }">
        {{ formatDate(row.updatedAt) }} {{ formatTime(row.updatedAt) }}
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
              <el-dropdown-item
                :icon="ElIconEdit"
                @click="handleEditTask(row)"
              >
                Edit
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
  <el-empty v-if="!data || data.length === 0" description="No tasks found" />

  <el-dialog
    v-model="showTaskForm"
    width="600px"
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
              <el-option
                v-for="status in taskStatuses"
                :key="status"
                :value="status"
                :label="status"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Due Date" required>
        <el-date-picker
          v-model="taskFormData.dueDate"
          type="date"
          placeholder="Due date"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { taskPriorities } from "~/constants/taskPriorities";
import { taskStatuses } from "~/constants/taskStatuses";

const props = defineProps({
  leadId: {
    type: [String, Number],
    required: false,
  },
  opportunityId: {
    type: [String, Number],
    required: false,
  },
  customerId: {
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
    newTask.leadId = props.leadId;
  }

  if (props.opportunityId) {
    newTask.opportunityId = props.opportunityId;
  }

  if (props.customerId) {
    newTask.customerId = props.customerId;
  }

  taskFormData.value = newTask;
  showTaskForm.value = true;
};

const handleEditTask = (task) => {
  taskFormData.value = { ...task };
  showTaskForm.value = true;
};

const handleDeleteTask = (id) => {
  ElMessageBox.confirm("Are you sure you want to delete this task?", "Warning", {
    type: "warning",
  })
    .then(() => {
      deleteTaskMutation(id);
    })
    .catch(() => {});
};

const { mutate: saveTaskMutation, isPending: isSaving } = useMutation({
  mutationFn: (data) => {
    return data.id
      ? request(`/api/tasks/${data.id}`, { method: "PATCH", body: data })
      : request("/api/tasks", { method: "POST", body: data });
  },
  onSuccess: () => {
    showTaskForm.value = false;
    taskFormData.value = {};
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    ElMessage({
      message: "Task saved successfully",
      type: "success",
      showClose: true,
    });
  },
  onError: (error) => {
    ElMessage({
      message: error.message || "Failed to save task",
      type: "error",
      showClose: true,
    });
  },
});

const saveTask = () => {
  saveTaskMutation(taskFormData.value);
};

const { mutate: deleteTaskMutation } = useMutation({
  mutationFn: (id) => {
    return request(`/api/tasks/${id}`, { method: "DELETE" });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    ElMessage({
      message: "Task deleted successfully",
      type: "success",
      showClose: true,
    });
  },
  onError: (error) => {
    ElMessage({
      message: error.message || "Failed to delete task",
      type: "error",
      showClose: true,
    });
  },
});

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
</script>
