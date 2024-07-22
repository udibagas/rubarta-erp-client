<template>
  <div class="text-right">
    <el-button
      size="small"
      :icon="Plus"
      @click="openForm({ ApprovalSettingItem: [] })"
      type="success"
    >
      ADD APPROVAL SETTING
    </el-button>
  </div>

  <br />

  <el-table stripe v-loading="loading" :data="tableData">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Company" width="220">
      <template #default="{ row }">
        {{ row.Company.name }}
      </template>
    </el-table-column>
    <el-table-column prop="approvalType" label="Approval Type" width="220">
    </el-table-column>

    <el-table-column label="Approvals">
      <template #default="{ row }">
        <div v-for="(item, i) in row.ApprovalSettingItem" :key="i">
          [{{ item.level }}] {{ item.approvalActionType }} -
          {{ item.User?.name }}
        </div>
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
                @click.native.prevent="deleteData(row.id)"
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
    width="700"
    :title="!!formModel.id ? 'EDIT APPROVAL' : 'ADD APPROVAL'"
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item label="Company" :error="formErrors.companyId">
        <el-select
          v-model="formModel.companyId"
          placeholder="Company"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in companies"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Approval Type" :error="formErrors.approvalType">
        <el-select
          v-model="formModel.approvalType"
          placeholder="Approval Type"
          style="width: 100%"
        >
          <el-option
            v-for="(type, i) in store.approvalTypes"
            :value="type"
            :label="type"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-table :data="formModel.ApprovalSettingItem">
      <el-table-column label="Level" width="180">
        <template #default="{ row }">
          <el-input-number
            v-model="row.level"
            placeholder="Level"
            :min="1"
            :max="3"
          ></el-input-number>
        </template>
      </el-table-column>

      <el-table-column label="Approval Action" width="180">
        <template #default="{ row }">
          <el-select
            v-model="row.approvalActionType"
            placeholder="Approval Action"
          >
            <el-option
              v-for="(type, i) in store.approvalActionTypes"
              :value="type"
              :label="type"
              :key="i"
            >
            </el-option>
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="User">
        <template #default="{ row }">
          <el-select v-model="row.userId" placeholder="User">
            <el-option
              v-for="(user, i) in users"
              :value="user.id"
              :label="user.name"
              :key="i"
            >
            </el-option>
          </el-select>
        </template>
      </el-table-column>

      <el-table-column width="60" header-align="center" align="center">
        <template #header>
          <el-button
            link
            :icon="Plus"
            type="success"
            @click="addItem"
          ></el-button>
        </template>
        <template #default="{ row, $index }">
          <el-button
            link
            :icon="Delete"
            type="danger"
            @click="deleteItem($index, row.id)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="closeForm">
        CANCEL
      </el-button>
      <el-button :icon="SuccessFilled" type="success" @click="save()">
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
} from "@element-plus/icons-vue";

const companies = computed(() => store.companies);
const users = computed(() => store.users);

const {
  showForm,
  formErrors,
  formModel,
  tableData,
  loading,
  openForm,
  save,
  deleteData,
  closeForm,
  requestData,
  refreshData,
  api,
} = useCrud("/api/approval-settings");

const addItem = () => {
  const newRow = {
    level: undefined,
    approvalActionType: undefined,
    userId: undefined,
  };

  formModel.value.ApprovalSettingItem.push(newRow);
};

const deleteItem = async (index, id) => {
  if (id) {
    await api(`/api/approval-settings/${formModel.value.id}/${id}`, {
      method: "DELETE",
    });
  }

  formModel.value.ApprovalSettingItem.splice(index, 1);
};

onMounted(() => {
  requestData();
});

onBeforeMount(async () => {
  await store.getCompanies();
  await store.getUsers();
});
</script>
