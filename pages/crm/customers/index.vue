<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="CRM / Customers">
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
      :data="data"
      height="calc(100vh - 155px)"
    >
      <el-table-column type="index" label="#"></el-table-column>

      <el-table-column label="Name" prop="name" min-width="150">
        <template #default="{ row }">
          <div class="font-semibold">
            {{ row.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Email" prop="email" min-width="150">
        <template #default="{ row }">
          <div class="flex items-center gap-1">
            <el-icon><ElIconMessage /></el-icon>
            <el-link type="success" :href="`mailto:${row.email}`">
              {{ row.email }}
            </el-link>
          </div>
          <div class="flex items-center gap-1">
            <el-icon><ElIconPhone /></el-icon>
            <span>
              {{ row.phone }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Address" prop="address" min-width="200">
        <template #default="{ row }">
          <div class="whitespace-pre-line">
            {{ row.address }}
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
} = useCrud({
  url: "/api/customers",
  queryKey: "customers",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();

const handleRowClick = (row) => {
  navigateTo(`/crm/customers/${row.id}`);
};
</script>
