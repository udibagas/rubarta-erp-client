<template>
  <el-dialog
    v-model="show"
    width="600px"
    :title="!!form.id ? 'EDIT TASK' : 'ADD TASK'"
    :close-on-click-modal="false"
  >
    <el-form label-width="140px" label-position="left">
      <el-form-item label="Title" :error="errors.title" required>
        <el-input placeholder="Task title" v-model="form.title"></el-input>
      </el-form-item>

      <el-form-item label="Description" :error="errors.description">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="Task description"
          v-model="form.description"
        ></el-input>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Priority" :error="errors.priority" required>
            <el-select v-model="form.priority" placeholder="Select priority">
              <el-option
                v-for="priority in taskPriorities"
                :key="priority"
                :value="priority"
                :label="priority"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Status" :error="errors.status" required>
            <el-select v-model="form.status" placeholder="Select status">
              <el-option
                v-for="status in taskStatuses"
                :key="status"
                :value="status"
                :label="status"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Due Date" :error="errors.dueDate" required>
        <el-date-picker
          v-model="form.dueDate"
          type="datetime"
          placeholder="Select due date"
          value-format="YYYY-MM-DDTHH:mm:ssZ"
          format="YYYY-MM-DD HH:mm"
          style="width: 100%"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item label="User" :error="errors.userId" required>
        <el-select
          v-model="form.userId"
          placeholder="Assign to user"
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

      <el-form-item label="Customer" :error="errors.customerId">
        <el-select
          v-model="form.customerId"
          placeholder="Related customer (optional)"
          filterable
          clearable
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
import { taskStatuses } from "~/constants/taskStatuses";
import { taskPriorities } from "~/constants/taskPriorities";

const { errors, form, show, closeForm, saveMutation, request } = useCrud({
  url: "/api/tasks",
  queryKey: "tasks",
});

const { mutate: save } = saveMutation();

// Initialize default values
watch(show, (newVal) => {
  if (newVal && !form.value.id) {
    form.value.status = "Todo";
    form.value.priority = "Medium";
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
