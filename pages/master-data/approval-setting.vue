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

  <el-row type="flex" :gutter="10">
    <el-col v-for="d in data" :key="d.id" :lg="8" :md="12" :sm="24">
      <el-card :body-style="{ padding: '5px' }">
        <el-descriptions border :column="1">
          <el-descriptions-item label="Company">
            <div
              style="
                display: flex;
                gap: 5px;
                align-items: center;
                justify-content: space-between;
              "
            >
              <strong>{{ d.Company.name }}</strong>
              <div>
                <el-button
                  link
                  :icon="ElIconEdit"
                  @click="openForm(d)"
                ></el-button>
                <el-button
                  type="danger"
                  link
                  :icon="ElIconDelete"
                  @click="handleRemove(d.id, remove)"
                ></el-button>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="Approval Type">
            {{ d.approvalType }}
          </el-descriptions-item>
          <el-descriptions-item label="Payment Target">
            {{ d.paymentType }}
          </el-descriptions-item>
          <el-descriptions-item label="NKP Type">
            {{ d.nkpType?.replace("_", " ") }}
          </el-descriptions-item>
        </el-descriptions>

        <div :style="{ margin: '20px 10px 10px 10px' }">
          <el-steps direction="vertical" :space="40">
            <el-step
              v-for="item in d.ApprovalSettingItem"
              :key="item.id"
              :title="item.User.name"
              :status="'wait'"
            ></el-step>
          </el-steps>
        </div>
      </el-card>
    </el-col>
  </el-row>

  <ApprovalSettingForm />
</template>

<script setup>
const { openForm, removeMutation, fetchData, handleRemove } = useCrud({
  url: "/api/approval-settings",
  queryKey: "approval-settings",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
