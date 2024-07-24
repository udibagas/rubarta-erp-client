<template>
  <form
    class="flex justify-content-end"
    @submit.prevent="userStore.requestData"
  >
    <el-button
      size="small"
      @click="userStore.openForm({ roles: ['USER'], password: '' })"
      type="success"
      :icon="Plus"
      class="mr-2"
    >
      ADD NEW USER
    </el-button>
    <el-input
      size="small"
      v-model="userStore.keyword"
      placeholder="Cari"
      style="width: 180px"
      :prefix-icon="Search"
      :clearable="true"
      @clear="userStore.requestData"
    >
    </el-input>
  </form>

  <br />

  <el-table stripe v-loading="userStore.loading" :data="userStore.users">
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
        {{ row.Department?.name }}
      </template>
    </el-table-column>

    <el-table-column label="Bank" min-width="150">
      <template #default="{ row }">
        {{ row.Bank?.name }} <br />
        {{ row.bankAccount }}
      </template>
    </el-table-column>

    <el-table-column prop="roles" label="Role" min-width="150">
      <template #default="{ row }">
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

    <el-table-column width="60px" align="center" header-align="center">
      <template #header>
        <el-button link @click="userStore.requestData" :icon="Refresh">
        </el-button>
      </template>
      <template #default="{ row }">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-icon>
              <MoreFilled />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                :icon="Edit"
                @click.native.prevent="userStore.openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="Delete"
                @click.native.prevent="userStore.remove(row.id)"
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
import {
  Refresh,
  Plus,
  Edit,
  Delete,
  MoreFilled,
  Search,
} from "@element-plus/icons-vue";

const userStore = useUserStore();

onMounted(() => {
  userStore.requestData();
});
</script>
