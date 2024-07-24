<template>
  <el-dialog
    v-model="companyStore.showForm"
    title="COMPANY"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Code" :error="companyStore.formErrors.code">
        <el-input
          placeholder="Code"
          v-model="companyStore.formModel.code"
        ></el-input>
      </el-form-item>

      <el-form-item label="Name" :error="companyStore.formErrors.name">
        <el-input
          placeholder="Name"
          v-model="companyStore.formModel.name"
        ></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="companyStore.closeForm">
        CANCEL
      </el-button>
      <el-button
        type="success"
        :icon="SuccessFilled"
        @click="companyStore.save"
      >
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
const companyStore = useCompaniesStore();
</script>
