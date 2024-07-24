<template>
  <el-dialog
    v-model="userStore.showForm"
    width="500px"
    :title="!!userStore.formModel.id ? 'EDIT USER' : 'ADD USER'"
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item label="Name" :error="userStore.formErrors.name">
        <el-input
          placeholder="Name"
          v-model="userStore.formModel.name"
        ></el-input>
      </el-form-item>

      <el-form-item label="Email" :error="userStore.formErrors.email">
        <el-input
          placeholder="Email"
          v-model="userStore.formModel.email"
        ></el-input>
      </el-form-item>

      <el-form-item label="Password" :error="userStore.formErrors.password">
        <el-input
          type="password"
          placeholder="Password"
          v-model="userStore.formModel.password"
        ></el-input>
      </el-form-item>

      <el-form-item label="Roles" :error="userStore.formErrors.roles">
        <el-select
          v-model="userStore.formModel.roles"
          placeholder="Roles"
          style="width: 100%"
          multiple
        >
          <el-option
            v-for="(role, i) in roles"
            :value="role"
            :label="role"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="Department"
        :error="userStore.formErrors.departmentId"
      >
        <el-select
          v-model="userStore.formModel.departmentId"
          placeholder="Department"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in departmentStore.departments"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Bank" :error="userStore.formErrors.bankId">
        <el-select
          v-model="userStore.formModel.bankId"
          placeholder="Bank"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in bankStore.banks"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="Bank Account"
        :error="userStore.formErrors.bankAccount"
      >
        <el-input
          placeholder="Bank Account"
          v-model="userStore.formModel.bankAccount"
        ></el-input>
      </el-form-item>

      <el-form-item label="Status" :error="userStore.formErrors.active">
        <el-switch
          :active-value="true"
          :inactive-value="false"
          v-model="userStore.formModel.active"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        >
        </el-switch>
        <el-tag
          :type="userStore.formModel.active ? 'success' : 'danger'"
          size="small"
          style="margin-left: 10px"
          effect="dark"
        >
          {{ !!userStore.formModel.active ? "Aktif" : "Nonaktif" }}
        </el-tag>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :icon="CircleCloseFilled" @click="userStore.closeForm">
        CANCEL
      </el-button>
      <el-button :icon="SuccessFilled" type="success" @click="userStore.save()">
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
import { roles } from "~/constants/roles";
const userStore = useUserStore();
const departmentStore = useDepartmentStore();
const bankStore = useBankStore();

onBeforeMount(async () => {
  await departmentStore.requestData();
  await bankStore.requestData();
});
</script>
