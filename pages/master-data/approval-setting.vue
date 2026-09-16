<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Approval Setting">
        <template #extra>
          <el-button
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
    </template>

    <el-table
      stripe
      v-loading="isPending"
      :data="data"
      height="calc(100vh - 155px)"
    >
      <el-table-column label="Company" width="220">
        <template #default="{ row }">
          {{ row.Company.name }}
        </template>
      </el-table-column>

      <el-table-column prop="approvalType" label="Approval Type">
        <template #default="{ row }">
          <el-tag effect="plain" size="small" class="mb-1">
            {{ row.approvalType.replaceAll("_", " ") }}
          </el-tag>
          <br />
          <el-tag
            effect="plain"
            type="info"
            size="small"
            v-if="row.paymentType"
            class="mr-1"
          >
            {{ row.paymentType }}
          </el-tag>
          <el-tag effect="plain" type="info" size="small" v-if="row.nkpType">
            {{ row.nkpType?.replace("_", " ") ?? " " }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Approvals">
        <template #default="{ row }">
          <div v-for="(item, i) in row.ApprovalSettingItem" :key="i">
            <div class="flex justify-between">
              <div class="flex items-center gap-2">
                <el-avatar
                  :size="20"
                  :style="{ backgroundColor: getAvatarColor(item.User?.name) }"
                >
                  <span class="text-xs">
                    {{ item.level }}
                  </span>
                </el-avatar>
                <span class="line-clamp-1">
                  {{ item.User?.name }}
                </span>
              </div>

              <el-tag effect="plain" type="warning" size="small" round>
                {{ item.approvalActionType }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column width="60px" align="center" header-align="center">
        <template #header>
          <el-button link @click="refreshData" :icon="ElIconRefresh">
          </el-button>
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
  </nuxt-layout>
</template>

<script setup>
definePageMeta({
  layout: false,
});

const {
  openForm,
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  companyId,
} = useCrud({
  url: "/api/approval-settings",
  queryKey: "approval-settings",
});

watch(companyId, () => {
  refreshData();
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
