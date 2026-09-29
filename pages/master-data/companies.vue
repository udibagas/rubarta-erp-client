<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Companies">
        <template #extra>
          <el-button
            :icon="ElIconPlus"
            type="success"
            @click="
              openForm({
                banks: [
                  {
                    name: '',
                    bankOffice: '',
                    accountNumber: '',
                    accountName: '',
                  },
                ],
              })
            "
          >
            ADD NEW COMPANY
          </el-button>
        </template>
      </el-page-header>
    </template>

    <el-table
      stripe
      :data="data"
      v-loading="isPending"
      height="calc(100vh - 155px)"
    >
      <el-table-column label="Name" min-width="150" prop="name">
        <template #default="{ row }">
          <div class="font-semibold">{{ row.code }}</div>
          <div>{{ row.name }}</div>
        </template>
      </el-table-column>

      <el-table-column label="Address" prop="address" min-width="200">
        <template #default="{ row }">
          <span style="white-space: pre-line">
            {{ row.address }}
          </span>
          <div>Phone: {{ row.phone }}</div>
        </template>
      </el-table-column>

      <el-table-column label="Banks" prop="banks" min-width="200">
        <template #default="{ row }">
          <div class="space-y-2">
            <div
              v-for="bank in row.banks"
              :key="bank.accountNumber"
              class="rounded border border-gray-200 bg-gray-50 px-3 py-2"
            >
              <div class="font-semibold leading-5 text-gray-800">
                {{ bank.accountName }}
              </div>
              <div class="font-mono text-sm tabular-nums text-gray-600">
                Acc No. {{ bank.accountNumber }}
              </div>
              <div
                class="text-xs font-medium uppercase tracking-wide text-gray-400"
              >
                {{ bank.name }} - {{ bank.bankOffice }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        min-width="100"
        label="Is Default"
        prop="isDefault"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            :type="row.isDefault ? 'success' : 'info'"
            round
            style="width: 60px"
            effect="dark"
          >
            {{ row.isDefault ? "Yes" : "No" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        fixed="right"
        width="60px"
        align="center"
        header-align="center"
      >
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

    <CompanyForm />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({
  layout: false,
});

const { openForm, removeMutation, fetchData, refreshData, handleRemove } =
  useCrud({
    url: "/api/companies",
    queryKey: "companies",
  });

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
