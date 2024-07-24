<template>
  <el-dialog
    v-model="approvalSettingStore.showForm"
    width="700"
    :title="
      approvalSettingStore.formModel.id ? 'EDIT APPROVAL' : 'ADD APPROVAL'
    "
    :close-on-click-modal="false"
  >
    <el-form label-width="160px" label-position="left">
      <el-form-item
        label="Company"
        :error="approvalSettingStore.formErrors.companyId"
      >
        <el-select
          v-model="approvalSettingStore.formModel.companyId"
          placeholder="Company"
          style="width: 100%"
        >
          <el-option
            v-for="(el, i) in companyStore.companies"
            :value="el.id"
            :label="`${el.code} - ${el.name}`"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="Approval Type"
        :error="approvalSettingStore.formErrors.approvalType"
      >
        <el-select
          v-model="approvalSettingStore.formModel.approvalType"
          placeholder="Approval Type"
          style="width: 100%"
        >
          <el-option
            v-for="(type, i) in store.approvalTypes"
            :value="type"
            :label="type"
            :key="i"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-table :data="approvalSettingStore.formModel.ApprovalSettingItem">
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
              v-for="(type, i) in store.approvalActionTypes"
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
              v-for="(user, i) in userStore.users"
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
            @click="approvalSettingStore.addItem"
          ></el-button>
        </template>
        <template #default="{ row, $index }">
          <el-button
            link
            :icon="Delete"
            type="danger"
            @click="approvalSettingStore.removeItem($index, row.id)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button
        :icon="CircleCloseFilled"
        @click="approvalSettingStore.closeForm"
      >
        CANCEL
      </el-button>
      <el-button
        :icon="SuccessFilled"
        type="success"
        @click="approvalSettingStore.save()"
      >
        SAVE
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  SuccessFilled,
  CircleCloseFilled,
  Delete,
  Plus,
} from "@element-plus/icons-vue";

const approvalSettingStore = useApprovalSettingStore();
const store = useWebsiteStore();
const companyStore = useCompanyStore();
const userStore = useUserStore();

onBeforeMount(async () => {
  await companyStore.requestData();
  await userStore.requestData();
});
</script>
