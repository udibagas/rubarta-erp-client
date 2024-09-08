<template>
  <el-page-header @back="goBack" content="CRM / Customers">
    <template #extra>
      <div class="flex">
        <el-button
          size="small"
          :icon="ElIconPlus"
          type="success"
          @click="openForm()"
          class="mr-2"
        >
          ADD NEW CUSTOMER
        </el-button>

        <el-input
          v-model="keyword"
          placeholder="Search"
          size="small"
          @change="refreshData()"
          clearable
        >
        </el-input>
      </div>
    </template>
  </el-page-header>

  <br />

  <el-table stripe v-loading="isPending" :data="data">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Name" prop="name" />
    <el-table-column label="Email" prop="email" width="150" />
    <el-table-column label="Phone" prop="phone" width="150" />
    <el-table-column label="Address" prop="address" />

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
