<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Tasks">
        <template #extra>
          <div class="flex gap-2 items-center">
            <el-radio-group
              v-model="viewMode"
              size="default"
              fill="rgb(149, 212, 117)"
            >
              <el-radio-button value="table">
                <el-icon><ElIconList /></el-icon>
                Table
              </el-radio-button>
              <el-radio-button value="kanban">
                <el-icon><ElIconMenu /></el-icon>
                Kanban
              </el-radio-button>
            </el-radio-group>

            <el-button :icon="ElIconPlus" type="success" @click="openForm()">
              Add Task
            </el-button>
          </div>
        </template>
      </el-page-header>
    </template>

    <div
      v-if="viewMode === 'table'"
      class="flex flex-wrap items-center gap-2 justify-between p-3 bg-slate-50 mb-2 rounded"
    >
      <div class="flex-1 flex items-center gap-2">
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
          <template #prefix>
            <el-icon><ElIconUser /></el-icon>
          </template>
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
          <template #prefix>
            <el-icon><ElIconFlag /></el-icon>
          </template>
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
          <template #prefix>
            <el-icon><ElIconStar /></el-icon>
          </template>
        </el-select>
      </div>

      <div>
        <el-input
          v-model="keyword"
          placeholder="Search"
          style="width: 180px"
          :prefix-icon="ElIconSearch"
          :clearable="true"
          class="mr-2"
          @change="refetch()"
          @clear="
            () => {
              page = 1;
              refetch();
            }
          "
        />

        <el-button @click="refetch()" :icon="ElIconRefresh" />
      </div>
    </div>

    <!-- SUMMARY -->
    <div class="grid grid-cols-4 gap-4 mb-2" v-if="viewMode === 'table'">
      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-gray-500 text-sm mb-1">Total Tasks</div>
            <div class="text-2xl font-bold">{{ summary?.total }}</div>
          </div>
          <el-icon :size="50">
            <ElIconDocument class="text-blue-500" />
          </el-icon>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-gray-500 text-sm mb-1">Pending Tasks</div>
            <div class="text-2xl font-bold text-orange-500">
              {{ summary?.pending }}
            </div>
          </div>
          <el-icon :size="50">
            <ElIconClock class="text-orange-500" />
          </el-icon>
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="text-gray-500 text-sm mb-1">Completed Tasks</div>
            <div class="text-2xl font-bold text-green-500">
              {{ summary?.completed }}
              <span class="text-xs text-yellow-500">{{ progress }}%</span>
            </div>
          </div>
          <el-progress
            type="circle"
            :stroke-width="5"
            :width="50"
            :percentage="progress"
            status="success"
            :color="
              progress >= 75
                ? '#67c23a'
                : progress >= 50
                  ? '#e6a23c'
                  : '#f56c6c'
            "
          />
        </div>
      </el-card>

      <el-card shadow="hover" class="summary-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-gray-500 text-sm mb-1">Overdue Tasks</div>
            <div class="text-2xl font-bold text-red-500">
              {{ summary?.overdue }}
            </div>
          </div>
          <el-icon :size="50">
            <ClockAlert class="text-red-500" />
          </el-icon>
        </div>
      </el-card>
    </div>

    <!-- Table View -->
    <el-table
      v-if="viewMode === 'table'"
      stripe
      v-loading="isPending"
      :data="data"
      @row-click="openDetailDialog"
      style="cursor: pointer"
      height="calc(100vh - 330px)"
      @sort-change="sortChange"
    >
      <el-table-column label="Title" prop="title" min-width="200">
        <template #default="{ row }">
          <div class="font-semibold">{{ row.title }}</div>
          <div class="text-xs text-gray-400 line-clamp-1">
            {{ row.description }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="User" min-width="150">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-avatar
              size="small"
              class="shrink-0"
              :style="{ backgroundColor: getAvatarColor(row.User?.name) }"
            >
              {{ row.User?.name?.charAt(0) }}
            </el-avatar>
            <span class="line-clamp-1">{{ row.User?.name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="Due Date"
        min-width="150"
        column-key="dueDate"
        prop="dueDate"
        sortable="custom"
      >
        <template #default="{ row }">
          <div>
            <div
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
            <div class="text-xs text-gray-400">
              {{ formatDate(row.dueDate) }}
              <span
                v-if="
                  (row.status === 'Todo' || row.status === 'InProgress') &&
                  dayjs(row.dueDate).isBefore(dayjs(), 'day')
                "
                class="text-red-500"
              >
                (Overdue)
              </span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="Priority"
        prop="priority"
        width="120"
        align="center"
        header-align="center"
        sortable="custom"
        column-key="priority"
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
                    : undefined
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
            <div>
              {{ dayjs(row.updatedAt).fromNow() }}
            </div>
            <div class="text-xs text-gray-400">
              {{ formatDate(row.updatedAt) }} {{ formatTime(row.updatedAt) }}
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
        column-key="status"
        sortable="custom"
      >
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

      <el-table-column
        width="60px"
        align="center"
        header-align="center"
        fixed="right"
      >
        <template #header>
          <el-button link @click="refetch()" :icon="ElIconRefresh"> </el-button>
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
      @refresh="refetch"
    />

    <TaskForm />

    <TaskDetailDialog
      v-model="showDetailDialog"
      :task-id="selectedTaskId"
      @task-updated="refetch"
      @edit-task="openForm"
    />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

import { ClockAlert } from "lucide-vue-next";
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
  handleRemove,
  sortChange,
  keyword,
  page,
  filters,
} = useCrud({
  url: "/api/tasks",
  queryKey: "tasks",
  // disable default pagination by setting page and pageSize to undefined
  defaultQuery: {
    page: undefined,
    pageSize: undefined,
  },
});

const { isPending, data, refetch } = fetchData();
const { mutate: remove } = removeMutation();

// Fetch users for filter dropdown
const request = useRequest();
const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => request("/api/users"),
});

const { data: summary, refetch: refetchSummary } = useQuery({
  queryKey: ["tasks-summary"],
  queryFn: () =>
    request("/api/tasks/summary", {
      params: {
        userId: filters.value.userId,
        status: filters.value.status,
        priority: filters.value.priority,
      },
    }),
});

const progress = computed(() => {
  if (!summary.value.total) return 0;
  return Math.round((summary.value.completed / summary.value.total) * 100);
});

// Apply filters
const applyFilters = () => {
  page.value = 1;
  refetch();
  refetchSummary();
};

// Open task detail dialog
const openDetailDialog = (task) => {
  selectedTaskId.value = task.id;
  showDetailDialog.value = true;
};
</script>
