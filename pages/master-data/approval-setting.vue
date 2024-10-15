<template>
  <el-page-header @back="goBack" content="Approval Setting">
    <template #extra>
      <el-button
        size="small"
        :icon="ElIconPlus"
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
    </template>
  </el-page-header>

  <br />

  <el-table stripe v-loading="isPending" :data="data">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Company" width="220">
      <template #default="{ row }">
        {{ row.Company.name }}
      </template>
    </el-table-column>
    <el-table-column prop="approvalType" label="Approval Type" width="150" />
    <el-table-column prop="paymentType" label="Payment Target" width="220" />
    <el-table-column label="Payment Type" width="220">
      <template #default="{ row }">
        {{ row.nkpType.replace("_", " ") }}
      </template>
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
        <el-button link @click="refreshData" :icon="ElIconRefresh"> </el-button>
      </template>
      <template #default="{ row }">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-icon>
              <ElIconMoreFilled />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                :icon="ElIconEdit"
                @click.native.prevent="openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="ElIconDelete"
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
const { openForm, removeMutation, fetchData, refreshData, handleRemove } =
  useCrud({
    url: "/api/approval-settings",
    queryKey: "approval-settings",
  });

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
