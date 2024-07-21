<template>
  <div class="text-right">
    <el-button size="small" :icon="Plus" @click="openForm()" type="success">
      ADD NEW COMPANY
    </el-button>
  </div>

  <br />

  <el-table :data="tableData" stripe v-loading="loading">
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
        <el-button link @click="requestData" :icon="Refresh"> </el-button>
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
    title="COMPANY"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Code" :error="formErrors.code">
        <el-input placeholder="Code" v-model="formModel.code"></el-input>
      </el-form-item>

      <el-form-item label="Name" :error="formErrors.name">
        <el-input placeholder="Name" v-model="formModel.name"></el-input>
      </el-form-item>
    </el-form>

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
// const store = useWebsiteStore();

import {
  Refresh,
  Plus,
  SuccessFilled,
  CircleCloseFilled,
  Edit,
  Delete,
  MoreFilled,
} from "@element-plus/icons-vue";

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
} = useCrud("/api/companies");

onMounted(() => {
  requestData();
});
</script>
