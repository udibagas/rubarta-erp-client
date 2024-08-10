<template>
  <el-dialog
    v-model="show"
    title="EXPENSE TYPE"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="150px" label-position="left">
      <el-form-item label="Name" :error="errors.name">
        <el-input placeholder="Name" v-model="form.name"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="ElIconCircleCloseFilled" @click="closeForm">
        CANCEL
      </el-button>
      <el-button :icon="ElIconSuccessFilled" type="success" @click="save(form)">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const { errors, form, show, closeForm, saveMutation } = useCrud({
  url: "/api/expense-types",
  queryKey: "expense-types",
});
const { mutate: save } = saveMutation();
</script>
