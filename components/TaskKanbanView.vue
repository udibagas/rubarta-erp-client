<template>
  <div class="kanban-board" v-loading="isPending">
    <div
      v-for="status in taskStatuses"
      :key="status"
      class="kanban-column"
      :style="{ backgroundColor: getStatusColor(status) + '15' }"
      @drop="handleDrop($event, status)"
      @dragover.prevent
      @dragenter.prevent
    >
      <div
        class="kanban-column-header"
        :style="{ backgroundColor: getStatusColor(status) }"
      >
        <div class="flex items-center gap-2 text-white">
          <el-icon>
            <ElIconCircleCheck v-if="status === 'Completed'" />
            <ElIconLoading v-else-if="status === 'InProgress'" />
            <ElIconWarning v-else-if="status === 'OnHold'" />
            <ElIconCircleClose v-else-if="status === 'Cancelled'" />
            <ElIconClock v-else />
          </el-icon>
          <span class="font-semibold">{{
            status.replace(/([A-Z])/g, " $1").trim()
          }}</span>
        </div>
        <el-badge :value="getTasksByStatus(status).length" />
      </div>

      <div class="kanban-cards">
        <div
          v-for="task in getTasksByStatus(status)"
          :key="task.id"
          class="kanban-card"
          draggable="true"
          @dragstart="handleDragStart($event, task)"
          @click="$emit('open-detail', task)"
        >
          <div class="kanban-card-header">
            <h4 class="kanban-card-title">{{ task.title }}</h4>
            <el-dropdown trigger="click" @click.stop>
              <el-icon class="kanban-card-menu">
                <ElIconMoreFilled />
              </el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    :icon="ElIconEdit"
                    @click.stop="$emit('edit-task', task)"
                  >
                    Edit
                  </el-dropdown-item>
                  <el-dropdown-item
                    :icon="ElIconDelete"
                    @click.stop="$emit('delete-task', task.id)"
                  >
                    Delete
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <p v-if="task.description" class="kanban-card-description">
            {{ task.description }}
          </p>

          <div class="kanban-card-footer">
            <div class="flex items-center gap-2">
              <el-avatar
                :size="24"
                :style="{ backgroundColor: getAvatarColor(task.User?.name) }"
              >
                {{ task.User?.name?.charAt(0) }}
              </el-avatar>
              <span class="text-xs">{{ task.User?.name }}</span>
            </div>

            <div class="text-xs text-gray-500">
              <el-icon><ElIconCalendar /></el-icon>
              {{ formatDate(task.dueDate) }}
            </div>
          </div>

          <div v-if="task.priority" class="kanban-card-priority">
            <el-tag
              :type="
                task.priority === 'High'
                  ? 'danger'
                  : task.priority === 'Medium'
                    ? 'warning'
                    : 'info'
              "
              size="small"
            >
              {{ task.priority }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getAvatarColor } from "~/utils/avatar";
import { taskStatuses } from "~/constants/taskStatuses";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  isPending: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "open-detail",
  "edit-task",
  "delete-task",
  "refresh",
]);

const request = useRequest();
const draggedTask = ref(null);

// Get tasks by status
const getTasksByStatus = (status) => {
  if (!props.data || !Array.isArray(props.data)) return [];
  return props.data.filter((task) => task.status === status);
};

// Get status color for kanban column headers
const getStatusColor = (status) => {
  const colors = {
    Todo: "#909399",
    InProgress: "#409eff",
    Completed: "#67c23a",
    Cancelled: "#f56c6c",
    OnHold: "#e6a23c",
  };
  return colors[status] || "#909399";
};

// Drag and drop handlers
const handleDragStart = (event, task) => {
  draggedTask.value = task;
  event.dataTransfer.effectAllowed = "move";
};

const handleDrop = async (event, newStatus) => {
  event.preventDefault();

  if (!draggedTask.value || draggedTask.value.status === newStatus) {
    draggedTask.value = null;
    return;
  }

  try {
    await request(`/api/tasks/${draggedTask.value.id}`, {
      method: "PATCH",
      body: {
        status: newStatus,
      },
    });

    ElMessage.success(
      `Task moved to ${newStatus.replace(/([A-Z])/g, " $1").trim()}`,
    );
    emit("refresh");
  } catch (error) {
    ElMessage.error("Failed to update task status");
  } finally {
    draggedTask.value = null;
  }
};
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}

.kanban-column {
  flex: 1;
  min-width: 300px;
  border-radius: 8px;
  padding: 12px;
  max-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.kanban-column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.kanban-column-header :deep(.el-badge__content) {
  background-color: rgba(255, 255, 255, 0.9);
  color: #303133;
  border: none;
}

.kanban-cards {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kanban-card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.kanban-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.kanban-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 8px;
}

.kanban-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.kanban-card-menu {
  color: #909399;
  cursor: pointer;
  transition: color 0.2s;
}

.kanban-card-menu:hover {
  color: #606266;
}

.kanban-card-description {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kanban-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.kanban-card-priority {
  position: absolute;
  top: 12px;
  right: 12px;
}
</style>
