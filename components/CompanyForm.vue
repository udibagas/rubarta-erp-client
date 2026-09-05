<template>
  <el-dialog
    v-model="show"
    title="COMPANY"
    width="500px"
    :close-on-click-modal="false"
    :before-close="closeForm"
  >
    <el-form label-width="100px" label-position="left">
      <el-form-item label="Code" :error="errors.code">
        <el-input placeholder="Code" v-model="form.code"></el-input>
      </el-form-item>

      <el-form-item label="Name" :error="errors.name">
        <el-input placeholder="Name" v-model="form.name"></el-input>
      </el-form-item>

      <el-form-item label="Address" :error="errors.address">
        <el-input
          type="textarea"
          :rows="4"
          placeholder="Address"
          v-model="form.address"
        ></el-input>
      </el-form-item>

      <el-form-item label="Phone" :error="errors.phone">
        <el-input placeholder="Phone" v-model="form.phone"></el-input>
      </el-form-item>

      <el-form-item label="Is Default" :error="errors.isDefault">
        <el-switch v-model="form.isDefault"></el-switch>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button
        :icon="ElIconCircleCloseFilled"
        @click="closeForm"
        type="info"
        plain
      >
        CANCEL
      </el-button>
      <el-button type="success" :icon="ElIconSuccessFilled" @click="save(form)">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const { errors, form, show, closeForm, saveMutation } = useCrud({
  url: "/api/companies",
  queryKey: "companies",
});
const { mutate: save } = saveMutation();
</script>
