<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Employees">
        <template #extra>
          <div class="flex gap-2">
            <el-input
              placeholder="Seach Employee"
              v-model="keyword"
              clearable
              class="w-48!"
              :prefix-icon="ElIconSearch"
              @change="() => refetch()"
              @clear="() => refetch()"
            />

            <el-button
              @click="openForm({ roles: ['USER'], password: '' })"
              type="success"
              :icon="ElIconPlus"
            >
              Add New Employee
            </el-button>
          </div>
        </template>
      </el-page-header>
    </template>
    <el-table
      stripe
      v-loading="isPending"
      :data="data?.data ?? []"
      height="calc(100vh - 195px)"
    >
      <el-table-column label="Name" min-width="150">
        <template #default="{ row }">
          <div class="font-semibold">{{ row.name }}</div>
          <div class="text-xs text-gray-400">{{ row.email }}</div>
        </template>
      </el-table-column>

      <el-table-column label="Department" min-width="150">
        <template #default="{ row }">
          <div class="line-clamp-1">
            {{ row.Department?.name }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Roles" min-width="150">
        <template #default="{ row }">
          <el-tag
            v-for="role in row.roles"
            :key="role"
            type="success"
            size="small"
            effect="plain"
            class="mr-1"
          >
            {{ role }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Bank" min-width="150">
        <template #default="{ row }">
          {{ row.Bank?.name }}
          <div class="text-xs text-gray-400">
            {{ row.bankAccount }} ({{ row.currency }})
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="status"
        label="Status"
        align="center"
        header-align="center"
        width="100"
      >
        <template #default="{ row }">
          <el-tag
            :type="row.active ? 'success' : 'danger'"
            size="small"
            style="width: 100%"
            effect="plain"
          >
            {{ row.active ? "Aktif" : "Nonaktif" }}
          </el-tag>
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

    <el-pagination
      class="p-2 bg-slate-100"
      v-if="data?.total"
      :current-page="page"
      size="small"
      background
      layout="total, sizes, prev, pager, next"
      :page-size="pageSize"
      :page-sizes="[10, 25, 50, 100]"
      :total="data?.total"
      @current-change="currentChange"
      @size-change="sizeChange"
    />

    <UserForm />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const {
  openForm,
  removeMutation,
  fetchData,
  handleRemove,
  keyword,
  page,
  pageSize,
  currentChange,
  sizeChange,
} = useCrud({
  url: "/api/users",
  queryKey: "users",
});

const { isPending, data, refetch } = fetchData();
const { mutate: remove } = removeMutation();
</script>
