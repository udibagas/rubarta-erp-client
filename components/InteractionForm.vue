<template>
  <el-dialog
    v-model="show"
    width="600px"
    :title="!!form.id ? 'EDIT INTERACTION' : 'ADD INTERACTION'"
    :close-on-click-modal="false"
  >
    <el-form label-width="140px" label-position="left">
      <el-form-item label="Customer" :error="errors.customerId" required>
        <el-select
          v-model="form.customerId"
          placeholder="Select customer"
          filterable
          default-first-option
        >
          <el-option
            v-for="customer in customers"
            :key="customer.id"
            :value="customer.id"
            :label="customer.name"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="User" :error="errors.userId" required>
        <el-select
          v-model="form.userId"
          placeholder="Select user"
          filterable
          default-first-option
        >
          <el-option
            v-for="user in users"
            :key="user.id"
            :value="user.id"
            :label="user.name"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Type" :error="errors.type" required>
            <el-select v-model="form.type" placeholder="Interaction type">
              <el-option
                v-for="type in interactionTypes"
                :key="type"
                :value="type"
                :label="type"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Duration (mins)" :error="errors.duration">
            <el-input-number
              v-model="form.duration"
              :min="0"
              placeholder="Duration in minutes"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Date" :error="errors.date" required>
        <el-date-picker
          v-model="form.date"
          type="datetime"
          placeholder="Interaction date"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm"
          style="width: 100%"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item label="Subject" :error="errors.subject" required>
        <el-input
          placeholder="Interaction subject"
          v-model="form.subject"
        ></el-input>
      </el-form-item>

      <el-form-item label="Notes" :error="errors.notes">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="Detailed notes"
          v-model="form.notes"
        ></el-input>
      </el-form-item>

      <el-form-item label="Outcome" :error="errors.outcome">
        <el-input
          placeholder="Outcome of the interaction"
          v-model="form.outcome"
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
import { interactionTypes } from "~/constants/interactionTypes";

const { errors, form, show, closeForm, saveMutation, request } = useCrud({
  url: "/api/interactions",
  queryKey: "interactions",
});

const { mutate: save } = saveMutation();

// Initialize default date
watch(show, (newVal) => {
  if (newVal && !form.value.id) {
    form.value.date = new Date().toISOString().slice(0, 19).replace("T", " ");
  }
});

const { data: customers } = useQuery({
  queryKey: ["customers"],
  queryFn: () => request("/api/customers"),
});

const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => request("/api/users"),
});
</script>
