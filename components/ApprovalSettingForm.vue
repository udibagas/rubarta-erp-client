<template>
  <el-dialog
    v-model="show"
    width="700"
    :title="form.id ? 'EDIT APPROVAL' : 'ADD APPROVAL'"
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item label="Company" :error="errors.companyId">
        <el-select
          v-model="form.companyId"
          placeholder="Company"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in companies"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Approval Type" :error="errors.approvalType">
        <el-select
          v-model="form.approvalType"
          placeholder="Approval Type"
          style="width: 100%"
        >
          <el-option
            v-for="(type, i) in approvalTypes"
            :value="type"
            :label="type"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-table :data="form.ApprovalSettingItem">
      <el-table-column label="Level" width="180">
        <template #default="{ row }">
          <el-input-number
            v-model="row.level"
            placeholder="Level"
            :min="1"
            :max="3"
          ></el-input-number>
        </template>
      </el-table-column>

      <el-table-column label="Approval Action" width="180">
        <template #default="{ row }">
          <el-select
            v-model="row.approvalActionType"
            placeholder="Approval Action"
          >
            <el-option
              v-for="(type, i) in approvalActionTypes"
              :value="type"
              :label="type"
              :key="i"
            >
            </el-option>
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="User">
        <template #default="{ row }">
          <el-select v-model="row.userId" placeholder="User">
            <el-option
              v-for="(user, i) in users"
              :value="user.id"
              :label="user.name"
              :key="i"
            >
            </el-option>
          </el-select>
        </template>
      </el-table-column>

      <el-table-column width="60" header-align="center" align="center">
        <template #header>
          <el-button
            link
            :icon="Plus"
            type="success"
            @click="addItem"
          ></el-button>
        </template>
        <template #default="{ row, $index }">
          <el-button
            link
            :icon="Delete"
            type="danger"
            @click="removeItem($index, row.id)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

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
import { approvalTypes } from "~/constants/approvalTypes";
import { approvalActionTypes } from "~/constants/approvalActionTypes";
const request = useRequest();

import {
  SuccessFilled,
  CircleCloseFilled,
  Delete,
  Plus,
} from "@element-plus/icons-vue";

const url = "/api/approval-settings";
const newRow = {
  level: undefined,
  approvalActionType: undefined,
  userId: undefined,
};

const { errors, form, show, closeForm, saveMutation } = useCrud({
  url,
  queryKey: "approval-settings",
});

const { mutate: save } = saveMutation();

const { data: companies } = useQuery({
  queryKey: ["companies"],
  queryFn: () => request("/api/companies"),
});

const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => request("/api/users"),
});

function addItem() {
  form.value.ApprovalSettingItem.push({ ...newRow });
}

async function removeItem(index, id) {
  if (id) {
    await request(`${url}/${form.value.id}/${id}`, {
      method: "DELETE",
    });
  }

  form.value.ApprovalSettingItem.splice(index, 1);
}
</script>
