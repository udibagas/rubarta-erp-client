<template>
  <el-dialog
    v-model="bankStore.showForm"
    title="BANK"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Code" :error="bankStore.formErrors.code">
        <el-input
          placeholder="Code"
          v-model="bankStore.formModel.code"
        ></el-input>
      </el-form-item>

      <el-form-item label="Name" :error="bankStore.formErrors.name">
        <el-input
          placeholder="Name"
          v-model="bankStore.formModel.name"
        ></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="bankStore.closeForm">
        CANCEL
      </el-button>
      <el-button :icon="SuccessFilled" type="success" @click="bankStore.save()">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
const bankStore = useBankStore();
</script>
