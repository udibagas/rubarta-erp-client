<template>
  <el-dialog
    v-model="show"
    width="500px"
    :title="!!form.id ? 'EDIT VENDOR' : 'ADD VENDOR'"
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item label="Name" :error="errors.name">
        <el-input placeholder="Name" v-model="form.name"></el-input>
      </el-form-item>

      <el-form-item label="Email" :error="errors.email">
        <el-input placeholder="Email" v-model="form.email"></el-input>
      </el-form-item>

      <el-form-item label="Phone" :error="errors.phone">
        <el-input placeholder="Phone" v-model="form.phone"></el-input>
      </el-form-item>

      <el-form-item label="Address" :error="errors.address">
        <el-input
          type="textarea"
          placeholder="Address"
          v-model="form.address"
        ></el-input>
      </el-form-item>

      <el-form-item label="Bank" :error="errors.bankId">
        <el-select v-model="form.bankId" placeholder="Bank" style="width: 100%">
          <el-option
            v-for="(el, i) in banks"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Bank Account" :error="errors.bankAccount">
        <el-input
          placeholder="Bank Account"
          v-model="form.bankAccount"
        ></el-input>
      </el-form-item>

      <el-form-item label="Currency" :error="errors.cusrrency">
        <el-select
          v-model="form.cusrrency"
          placeholder="Currency"
          style="width: 100%"
        >
          <el-option
            v-for="(c, i) in currencies"
            :value="c"
            :label="c"
            :key="i"
          >
          </el-option>
        </el-select>
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
import { currencies } from "~/constants/currencies";
const { errors, form, show, closeForm, saveMutation, request } = useCrud({
  url: "/api/suppliers",
  queryKey: "suppliers",
});
const { mutate: save } = saveMutation();

const { data: banks } = useQuery({
  queryKey: ["banks"],
  queryFn: () => request("/api/banks"),
});
</script>
