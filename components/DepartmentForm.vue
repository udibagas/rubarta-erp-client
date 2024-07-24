<template>
  <el-dialog
    v-model="departmentStore.showForm"
    title="DEPARTMENT"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Code" :error="departmentStore.formErrors.code">
        <el-input
          placeholder="Code"
          v-model="departmentStore.formModel.code"
        ></el-input>
      </el-form-item>

      <el-form-item label="Name" :error="departmentStore.formErrors.name">
        <el-input
          placeholder="Name"
          v-model="departmentStore.formModel.name"
        ></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="departmentStore.closeForm">
        CANCEL
      </el-button>
      <el-button
        :icon="SuccessFilled"
        type="success"
        @click="departmentStore.save()"
      >
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
const departmentStore = useDepartmentStore();
</script>
