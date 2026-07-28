<template>
  <el-dialog
    v-model="show"
    width="500px"
    :title="!!form.id ? 'EDIT CONTACT' : 'ADD CONTACT'"
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item label="Customer" :error="errors.customerId">
        <el-select
          v-model="form.customerId"
          placeholder="Customer"
          filterable
          default-first-option
        >
          <el-option
            v-for="(el, i) in customers"
            :value="el.id"
            :label="el.name"
            :key="i"
          >
          </el-option>
          <template #prefix>
            <el-icon><ElIconOfficeBuilding /></el-icon>
          </template>
        </el-select>
      </el-form-item>

      <el-form-item label="Name" :error="errors.name">
        <el-input
          placeholder="Name"
          v-model="form.name"
          :prefix-icon="ElIconUser"
        />
      </el-form-item>

      <el-form-item label="Email" :error="errors.email">
        <el-input
          placeholder="Email"
          v-model="form.email"
          :prefix-icon="ElIconMessage"
        />
      </el-form-item>

      <el-form-item label="Phone" :error="errors.phone">
        <el-input
          placeholder="Phone"
          v-model="form.phone"
          :prefix-icon="ElIconPhone"
        />
      </el-form-item>

      <el-form-item label="Position" :error="errors.position">
        <el-input
          placeholder="Position"
          v-model="form.position"
          :prefix-icon="ElIconStar"
        />
      </el-form-item>

      <el-form-item label="Notes" :error="errors.notes">
        <el-input type="textarea" placeholder="Notes" v-model="form.notes" />
      </el-form-item>

      <el-form-item label="Is Primary" :error="errors.isPrimary">
        <el-switch
          v-model="form.isPrimary"
          inline-prompt
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          active-text="Yes"
          inactive-text="No"
        />
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
import { useQuery } from "@tanstack/vue-query";
const { errors, form, show, closeForm, saveMutation, request } = useCrud({
  url: "/api/contacts",
  queryKey: "contacts",
});
const { mutate: save } = saveMutation();

const { data: customers } = useQuery({
  queryKey: ["customers"],
  queryFn: () => request("/api/customers"),
});
</script>
