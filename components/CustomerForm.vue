<template>
  <el-dialog
    v-model="show"
    width="500px"
    :title="!!form.id ? 'EDIT CUSTOMER' : 'ADD CUSTOMER'"
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item label="Name" :error="errors.name">
        <el-input placeholder="Name" v-model="form.name"></el-input>
      </el-form-item>

      <el-form-item label="Address" :error="errors.address">
        <el-input
          type="textarea"
          placeholder="Address"
          v-model="form.address"
        ></el-input>
      </el-form-item>

      <el-form-item label="Email" :error="errors.email">
        <el-input placeholder="Email" v-model="form.email"></el-input>
      </el-form-item>

      <el-form-item label="Phone" :error="errors.phone">
        <el-input placeholder="Phone" v-model="form.phone"></el-input>
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
const { errors, form, show, closeForm, saveMutation, request } = useCrud({
  url: "/api/customers",
  queryKey: "customers",
});
const { mutate: save } = saveMutation();
</script>
