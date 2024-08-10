<template>
  <el-page-header @back="goBack" content="Departments">
    <template #extra>
      <el-button
        size="small"
        :icon="ElIconPlus"
        type="success"
        @click="openForm()"
      >
        ADD NEW DEPARTMENT
      </el-button>
    </template>
  </el-page-header>

  <br />

  <el-table stripe :data="data" v-loading="isPending">
    <el-table-column type="index" label="#"></el-table-column>
    <el-table-column min-width="100" label="Code" prop="code"></el-table-column>
    <el-table-column min-width="100" label="Name" prop="name"></el-table-column>

    <el-table-column
      fixed="right"
      width="60px"
      align="center"
      header-align="center"
    >
      <template #header>
        <el-button link @click="refreshData" :icon="ElIconRefresh"> </el-button>
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

  <DepartmentForm />
</template>

<script setup>
const { openForm, removeMutation, fetchData, refreshData, handleRemove } =
  useCrud({
    url: "/api/departments",
    queryKey: "departments",
  });

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
