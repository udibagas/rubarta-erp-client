<template>
  <div class="text-right">
    <el-button
      size="small"
      :icon="Plus"
      type="success"
      @click="
        openForm({
          ApprovalSettingItem: [
            {
              level: undefined,
              approvalActionType: undefined,
              userId: undefined,
            },
          ],
        })
      "
    >
      ADD APPROVAL SETTING
    </el-button>
  </div>

  <br />

  <el-table stripe v-loading="isPending" :data="data">
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
        <el-button link @click="refreshData" :icon="Refresh"> </el-button>
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
                @click.native.prevent="edit(row.id)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="Delete"
                @click.native.prevent="handleRemove(row.id, remove)"
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

const { openForm, removeMutation, fetchData, refreshData, handleRemove, edit } =
  useCrud({
    url: "/api/approval-settings",
    queryKey: "approval-settings",
  });

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
