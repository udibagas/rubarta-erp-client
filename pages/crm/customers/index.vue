<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Customers">
        <template #extra>
          <div class="flex gap-2">
            <el-input
              v-model="keyword"
              placeholder="Search"
              @change="refreshData()"
              clearable
              :prefix-icon="ElIconSearch"
              style="width: 200px"
            />
            <el-button :icon="ElIconPlus" type="success" @click="openForm()" />
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
      <el-table-column label="Name" prop="name" min-width="200">
        <template #default="{ row }">
          <el-link
            @click="navigateTo(`/crm/customers/${row.id}`)"
            type="success"
          >
            {{ row.name }}
          </el-link>
          <br />
          <el-link :href="row.website" target="_blank" class="text-xs!">
            {{ row.website }}
          </el-link>
        </template>
      </el-table-column>

      <el-table-column label="Industry" prop="industry" min-width="200">
        <template #default="{ row }">
          <div
            v-if="row.industry || row.tags?.length > 0"
            class="flex gap-1 flex-wrap mt-1"
          >
            <el-tag size="small" v-if="row.industry" effect="plain" type="info">
              {{ row.industry }}
            </el-tag>
            <el-tag
              size="small"
              effect="plain"
              v-for="t in row.tags"
              :key="t"
              type="info"
            >
              {{ t }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Contact" prop="email" min-width="200">
        <template #default="{ row }">
          <el-link :href="`mailto:${row.email}`">
            {{ row.email }}
          </el-link>
          <div class="text-xs text-gray-400">
            {{ row.phone }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Account Manager" width="180">
        <template #default="{ row }">
          <div class="flex items-center gap-2" v-if="row.accountManagerId">
            <el-avatar
              size="small"
              class="shrink-0"
              :style="{
                backgroundColor: getAvatarColor(row.accountManager?.name),
              }"
            >
              {{ row.accountManager?.name?.charAt(0) }}
            </el-avatar>
            <span class="font-semibold line-clamp-1">{{
              row.accountManager?.name
            }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="Status"
        prop="isActive"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'danger'" effect="plain">
            {{ row.isActive ? "Active" : "Inactive" }}
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
          <el-button link @click="refreshData()" :icon="ElIconRefresh">
          </el-button>
        </template>
        <template #default="{ row }">
          <el-dropdown @click.stop>
            <span class="el-dropdown-link">
              <el-icon>
                <ElIconMoreFilled />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :icon="ElIconView"
                  @click.native.prevent="navigateTo(`/crm/customers/${row.id}`)"
                >
                  View Details
                </el-dropdown-item>
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

    <CustomerForm />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({
  layout: false,
});

const {
  openForm,
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  keyword,
  page,
  pageSize,
  currentChange,
  sizeChange,
} = useCrud({
  url: "/api/customers",
  queryKey: "customers",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
