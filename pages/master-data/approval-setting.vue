<template>
  <div class="text-right">
    <el-button
      size="small"
      :icon="Plus"
      type="success"
      @click="
        approvalSettingStore.openForm({
          ApprovalSettingItem: [{ ...approvalSettingStore.newRow }],
        })
      "
    >
      ADD APPROVAL SETTING
    </el-button>
  </div>

  <br />

  <el-table
    stripe
    v-loading="approvalSettingStore.loading"
    :data="approvalSettingStore.approvalSettings"
  >
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Company" width="220">
      <template #default="{ row }">
        {{ row.Company.name }}
      </template>
    </el-table-column>
    <el-table-column prop="approvalType" label="Approval Type" width="220">
    </el-table-column>

    <el-table-column label="Approvals">
      <template #default="{ row }">
        <div v-for="(item, i) in row.ApprovalSettingItem" :key="i">
          [{{ item.level }}] {{ item.approvalActionType }} -
          {{ item.User?.name }}
        </div>
      </template>
    </el-table-column>

    <el-table-column width="60px" align="center" header-align="center">
      <template #header>
        <el-button
          link
          @click="approvalSettingStore.requestData"
          :icon="Refresh"
        >
        </el-button>
      </template>
      <template #default="{ row }">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-icon>
              <MoreFilled />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                :icon="Edit"
                @click.native.prevent="approvalSettingStore.openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="Delete"
                @click.native.prevent="approvalSettingStore.item(row.id)"
              >
                Delete
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>

  <ApprovalSettingForm />
</template>

<script setup>
import {
  Refresh,
  Plus,
  Edit,
  Delete,
  MoreFilled,
} from "@element-plus/icons-vue";

const approvalSettingStore = useApprovalSettingStore();

onMounted(() => {
  approvalSettingStore.requestData();
});
</script>
