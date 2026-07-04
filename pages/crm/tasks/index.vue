<template>
  <el-page-header @back="goBack" content="CRM / Tasks">
    <template #extra>
      <form
        class="flex gap-2"
        @submit.prevent="
          () => {
            page = 1;
            refreshData();
          }
        "
      >
        <el-input
          v-model="keyword"
          placeholder="Cari"
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
    </template>
  </el-page-header>

  <br />

  <el-table
    stripe
    v-loading="isPending"
    :data="data"
    @row-click="(row) => navigateTo(`/crm/tasks/${row.id}`)"
    style="cursor: pointer"
  >
    <el-table-column label="Title" prop="title" />
    <el-table-column label="User" width="180">
      <template #default="{ row }">
        <div style="display: flex; align-items: center; gap: 10px">
          <el-avatar
            :size="32"
            class="shrink-0"
            :style="{ backgroundColor: getAvatarColor(row.User?.name) }"
          >
            {{ row.User?.name?.charAt(0) }}
          </el-avatar>
          <span>{{ row.User?.name }}</span>
        </div>
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

  <TaskForm />
</template>

<script setup>
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getAvatarColor } from "~/utils/avatar";

dayjs.extend(relativeTime);

const {
  openForm,
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  keyword,
  page,
} = useCrud({
  url: "/api/tasks",
  queryKey: "tasks",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
