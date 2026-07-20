<template>
  <el-page-header @back="goBack" content="CRM / Interactions">
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
    :data="data?.data ?? []"
    @row-click="(row) => navigateTo(`/crm/interactions/${row.id}`)"
    style="cursor: pointer"
  >
    <el-table-column label="Subject" min-width="200">
      <template #default="{ row }">
        <div>
          <strong>{{ row.subject }}</strong>
        </div>
        <div v-if="row.notes" class="text-sm text-gray-500">
          {{ row.notes }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Date" width="150">
      <template #default="{ row }">
        <div>
          <div class="font-semibold">{{ dayjs(row.date).fromNow() }}</div>
          <div class="text-xs text-gray-500">
            {{ formatDate(row.date) }} {{ formatTime(row.date) }}
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Type" width="150" align="center">
      <template #default="{ row }">
        <StatusTag :status="row.type" size="medium">
          <template #icon>
            <el-icon>
              <Phone v-if="row.type === 'Call'" />
              <Message v-else-if="row.type === 'Email'" />
              <Calendar v-else-if="row.type === 'Meeting'" />
              <Monitor v-else-if="row.type === 'Demo'" />
              <Location v-else-if="row.type === 'SiteVisit'" />
              <Document v-else-if="row.type === 'Presentation'" />
              <Refresh v-else-if="row.type === 'FollowUp'" />
              <More v-else />
            </el-icon>
          </template>
        </StatusTag>
      </template>
    </el-table-column>

    <el-table-column label="Duration" width="100" align="center">
      <template #default="{ row }">
        {{ row.duration ? `${row.duration} min` : "-" }}
      </template>
    </el-table-column>
    <el-table-column label="Contact" width="220">
      <template #default="{ row }">
        <div v-if="row.Contact" class="flex items-center gap-2">
          <el-avatar
            :size="32"
            :style="{ backgroundColor: getAvatarColor(row.Contact.name) }"
          >
            {{ row.Contact.name?.charAt(0).toUpperCase() }}
          </el-avatar>
          <div class="flex flex-col">
            <span class="font-semibold text-sm">{{ row.Contact.name }}</span>
            <div class="text-xs text-gray-500">
              <div v-if="row.Contact.email">{{ row.Contact.email }}</div>
              <div v-if="row.Contact.phone">{{ row.Contact.phone }}</div>
            </div>
          </div>
        </div>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column label="User" width="180">
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
    <el-table-column label="Outcome" prop="outcome" min-width="150" />

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

  <br />

  <el-pagination
    v-if="data?.total"
    size="small"
    background
    layout="total, sizes, prev, pager, next"
    :page-size="pageSize"
    :page-sizes="[10, 25, 50, 100]"
    :total="data?.total"
    @current-change="currentChange"
    @size-change="sizeChange"
  />

  <InteractionForm />
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
  pageSize,
  sizeChange,
  currentChange,
} = useCrud({
  url: "/api/interactions",
  queryKey: "interactions",
  defaultQuery: {
    isPaginated: true,
  },
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
