<template>
  <el-dialog
    v-model="expenseTypeStore.showForm"
    title="EXPENSE TYPE"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Name" :error="expenseTypeStore.formErrors.name">
        <el-input
          placeholder="Name"
          v-model="expenseTypeStore.formModel.name"
        ></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="expenseTypeStore.closeForm">
        CANCEL
      </el-button>
      <el-button
        :icon="SuccessFilled"
        type="success"
        @click="expenseTypeStore.save()"
      >
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
const expenseTypeStore = useExpenseTypeStore();
</script>
