<template>
  <el-page-header @back="goBack" content="Employees">
    <template #extra>
      <el-button
        size="small"
        @click="openForm({ roles: ['USER'], password: '' })"
        type="success"
        :icon="ElIconPlus"
      >
        ADD NEW EMPLOYEE
      </el-button>
    </template>
  </el-page-header>

  <br />

  <el-table stripe v-loading="isPending" :data="data">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Name" min-width="150">
      <template #default="{ row }">
        <strong>{{ row.name }}</strong>
        <br />
        {{ row.email }}
      </template>
    </el-table-column>

    <el-table-column label="Department" min-width="150">
      <template #default="{ row }">
        {{ row.Department?.name }} <br />
        <el-tag
          v-for="role in row.roles"
          :key="role"
          type="info"
          size="small"
          effect="dark"
          class="mr-1"
        >
          {{ role }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="Bank" min-width="150">
      <template #default="{ row }">
        {{ row.Bank?.name }} <br />
        {{ row.bankAccount }} ({{ row.currency }})
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
          effect="dark"
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

  <UserForm />
</template>

<script setup>
const { openForm, removeMutation, fetchData, refreshData, handleRemove } =
  useCrud({
    url: "/api/users",
    queryKey: "users",
  });

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
