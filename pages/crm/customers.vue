<template>
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

  <br />

  <el-table stripe v-loading="isPending" :data="data">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Name" prop="name" min-width="150" />
    <el-table-column label="Email" prop="email" min-width="150" />
    <el-table-column label="Phone" prop="phone" min-width="150" />
    <el-table-column label="Address" prop="address" min-width="200" />

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

  <CustomerForm />
</template>

<script setup>
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
</script>
