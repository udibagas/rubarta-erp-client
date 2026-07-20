<template>
  <el-page-header @back="goBack" content="CRM / Tasks">
    <template #extra>
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

        <form
          v-if="viewMode === 'table'"
          class="flex gap-2"
          @submit.prevent="
            () => {
              page = 1;
              refreshData();
            }
          "
        >
          <el-select
            v-model="filters.userId"
            placeholder="User"
            style="width: 150px"
            clearable
            @change="applyFilters"
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>

          <el-select
            v-model="filters.status"
            placeholder="Status"
            style="width: 140px"
            clearable
            @change="applyFilters"
          >
            <el-option
              v-for="status in taskStatuses"
              :key="status"
              :label="status.replace(/([A-Z])/g, ' $1').trim()"
              :value="status"
            />
          </el-select>

          <el-select
            v-model="filters.priority"
            placeholder="Priority"
            style="width: 120px"
            clearable
            @change="applyFilters"
          >
            <el-option
              v-for="priority in taskPriorities"
              :key="priority"
              :label="priority"
              :value="priority"
            />
          </el-select>

          <el-input
            v-model="keyword"
            placeholder="Search"
            style="width: 180px"
            :prefix-icon="ElIconSearch"
            :clearable="true"
            @clear="
              () => {
                page = 1;
                refreshData();
              }
            "
          />
        </form>

        <el-button :icon="ElIconPlus" type="success" @click="openForm()" />
      </div>
    </template>
  </el-page-header>

  <br />

  <!-- Table View -->
  <el-table
    v-if="viewMode === 'table'"
    stripe
    v-loading="isPending"
    :data="data"
    @row-click="openDetailDialog"
    style="cursor: pointer"
  >
    <el-table-column label="Title" prop="title">
      <template #default="{ row }">
        <div class="font-semibold">{{ row.title }}</div>
        {{ row.description }}
      </template>
    </el-table-column>

    <el-table-column label="User">
      <template #default="{ row }">
        <div style="display: flex; align-items: center; gap: 10px">
          <el-avatar
            :size="30"
            class="shrink-0"
            :style="{ backgroundColor: getAvatarColor(row.User?.name) }"
          >
            {{ row.User?.name?.charAt(0) }}
          </el-avatar>
          <span>{{ row.User?.name }}</span>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Due Date">
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

    <el-table-column
      label="Status"
      prop="status"
      width="140"
      align="center"
      header-align="center"
    >
      <template #default="{ row }">
        <StatusTag :status="row.status" style="width: 100%" effect="dark">
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

    <el-table-column
      label="Priority"
      prop="priority"
      width="120"
      align="center"
      header-align="center"
    >
      <template #default="{ row }">
        <el-tag
          v-if="row.priority"
          :type="
            row.priority === 'Urgent'
              ? 'danger'
              : row.priority === 'High'
                ? 'warning'
                : row.priority === 'Medium'
                  ? 'info'
                  : ''
          "
          size="small"
        >
          {{ row.priority }}
        </el-tag>
        <span v-else class="text-gray-400">-</span>
      </template>
    </el-table-column>

    <el-table-column label="Last Update" width="150">
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

    <el-table-column
      width="60px"
      align="center"
      header-align="center"
      fixed="right"
    >
      <template #header>
        <el-button link @click="refreshData()" :icon="ElIconRefresh">
        </el-button>
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
              <el-dropdown-item
                :icon="ElIconEdit"
                @click.native.prevent="openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconDelete"
                @click.native.prevent="handleRemove(row.id, remove)"
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
    @edit-task="openForm"
    @delete-task="(id) => handleRemove(id, remove)"
    @refresh="refreshData"
  />

  <TaskForm />

  <TaskDetailDialog
    v-model="showDetailDialog"
    :task-id="selectedTaskId"
    @task-updated="refreshData"
    @edit-task="openForm"
  />
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getAvatarColor } from "~/utils/avatar";
import { taskStatuses } from "~/constants/taskStatuses";
import { taskPriorities } from "~/constants/taskPriorities";

dayjs.extend(relativeTime);

const viewMode = ref("table");
const showDetailDialog = ref(false);
const selectedTaskId = ref(null);

const {
  openForm,
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  keyword,
  page,
  filters,
} = useCrud({
  url: "/api/tasks",
  queryKey: "tasks",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();

// Fetch users for filter dropdown
const request = useRequest();
const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => request("/api/users"),
});

// Apply filters
const applyFilters = () => {
  page.value = 1;
  refreshData();
};

// Open task detail dialog
const openDetailDialog = (task) => {
  selectedTaskId.value = task.id;
  showDetailDialog.value = true;
};
</script>
