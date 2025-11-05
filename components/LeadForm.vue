<template>
  <el-dialog
    v-model="show"
    width="500px"
    :title="!!form.id ? 'EDIT LEAD' : 'ADD LEAD'"
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item label="Company" :error="errors.companyId">
        <el-select v-model="form.companyId" placeholder="Company" disabled>
          <el-option
            v-for="(el, i) in companies"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

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
        </el-select>
      </el-form-item>

      <el-form-item label="Source" :error="errors.source">
        <el-select v-model="form.source" placeholder="Source">
          <el-option
            v-for="(el, i) in leadSources"
            :value="el"
            :label="el"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Status" :error="errors.status">
        <el-select v-model="form.status" placeholder="Status">
          <el-option
            v-for="(el, i) in leadStatuses"
            :value="el"
            :label="el"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Notes" :error="errors.notes">
        <el-input
          type="textarea"
          placeholder="Notes"
          v-model="form.notes"
        ></el-input>
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
import { leadSources } from "~/constants/leadSources";
import { leadStatuses } from "~/constants/leadStatuses";

const { errors, form, show, closeForm, saveMutation, request } = useCrud({
  url: "/api/leads",
  queryKey: "leads",
});

const { mutate: save } = saveMutation();

const { data: customers } = useQuery({
  queryKey: ["customers"],
  queryFn: () => request("/api/customers"),
});

const { data: companies } = useQuery({
  queryKey: ["companies"],
  queryFn: () => request("/api/companies"),
});
</script>
