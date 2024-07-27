<template>
  <el-dialog
    v-model="show"
    title="COMPANY"
    width="500px"
    :close-on-click-modal="false"
    :before-close="closeForm"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Code" :error="errors.code">
        <el-input placeholder="Code" v-model="form.code"></el-input>
      </el-form-item>

      <el-form-item label="Name" :error="errors.name">
        <el-input placeholder="Name" v-model="form.name"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="closeForm">
        CANCEL
      </el-button>
      <el-button type="success" :icon="SuccessFilled" @click="save(form)">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
const { errors, form, show, closeForm, saveMutation } = useCrud({
  url: "/api/companies",
  queryKey: "companies",
});
const { mutate: save } = saveMutation();
</script>
