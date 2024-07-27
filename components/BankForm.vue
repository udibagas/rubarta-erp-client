<template>
  <el-dialog
    v-model="show"
    title="BANK"
    width="500px"
    :close-on-click-modal="false"
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
      <el-button :icon="SuccessFilled" type="success" @click="save(form)">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
const { errors, form, show, closeForm, saveMutation } = useCrud({
  url: "/api/banks",
  queryKey: "banks",
});
const { mutate: save } = saveMutation();
</script>
