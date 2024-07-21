<template>
  <form class="flex justify-content-end" @submit.prevent="searchData">
    <el-button
      size="small"
      @click="openForm({ roles: ['USER'], password: '' })"
      type="success"
      :icon="Plus"
      class="mr-2"
    >
      ADD NEW USER
    </el-button>
    <el-input
      size="small"
      v-model="keyword"
      placeholder="Cari"
      style="width: 180px"
      :prefix-icon="Search"
      :clearable="true"
    >
    </el-input>
  </form>

  <br />

  <el-table stripe v-loading="loading" :data="tableData">
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
        <el-button link @click="refreshData" :icon="Refresh"> </el-button>
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
                @click.native.prevent="openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="Delete"
                @click.native.prevent="deleteData(row.id, store.getUsers)"
              >
                Delete
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog
    v-model="showForm"
    width="500px"
    :title="!!formModel.id ? 'EDIT USER' : 'ADD USER'"
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item label="Name" :error="formErrors.name">
        <el-input placeholder="Name" v-model="formModel.name"></el-input>
      </el-form-item>

      <el-form-item label="Email" :error="formErrors.email">
        <el-input placeholder="Email" v-model="formModel.email"></el-input>
      </el-form-item>

      <el-form-item label="Password" :error="formErrors.password">
        <el-input
          type="password"
          placeholder="Password"
          v-model="formModel.password"
        ></el-input>
      </el-form-item>

      <el-form-item label="Roles" :error="formErrors.roles">
        <el-select
          v-model="formModel.roles"
          placeholder="Roles"
          style="width: 100%"
          multiple
        >
          <el-option
            v-for="(role, i) in [
              'USER',
              'APPROVER',
              'VERIFIER',
              'AUTHORIZER',
              'ADMIN',
            ]"
            :value="role"
            :label="role"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Department" :error="formErrors.departmentId">
        <el-select
          v-model="formModel.departmentId"
          placeholder="Department"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in departments"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Bank" :error="formErrors.bankId">
        <el-select
          v-model="formModel.bankId"
          placeholder="Bank"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in banks"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Bank Account" :error="formErrors.bankAccount">
        <el-input
          placeholder="Bank Account"
          v-model="formModel.bankAccount"
        ></el-input>
      </el-form-item>

      <el-form-item label="Status" :error="formErrors.active">
        <el-switch
          :active-value="true"
          :inactive-value="false"
          v-model="formModel.active"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        >
        </el-switch>
        <el-tag
          :type="formModel.active ? 'success' : 'danger'"
          size="small"
          style="margin-left: 10px"
          effect="dark"
        >
          {{ !!formModel.active ? "Aktif" : "Nonaktif" }}
        </el-tag>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="closeForm">
        CANCEL
      </el-button>
      <el-button
        :icon="SuccessFilled"
        type="success"
        @click="save(store.getUsers)"
      >
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const store = useWebsiteStore();

import {
  Refresh,
  Plus,
  SuccessFilled,
  CircleCloseFilled,
  Edit,
  Delete,
  MoreFilled,
  Search,
} from "@element-plus/icons-vue";

const departments = computed(() => store.departments);
const banks = computed(() => store.banks);

const {
  showForm,
  formErrors,
  formModel,
  tableData,
  loading,
  keyword,
  openForm,
  save,
  deleteData,
  closeForm,
  requestData,
  searchData,
  refreshData,
} = useCrud("/api/users");

onMounted(() => {
  requestData();
});

onBeforeMount(async () => {
  await store.getDepartments();
  await store.getBanks();
});
</script>
