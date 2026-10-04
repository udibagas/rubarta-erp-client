<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Companies">
        <template #extra>
          <el-button
            :icon="ElIconPlus"
            type="success"
            @click="openForm(defaultData)"
          >
            Add New Company
          </el-button>

          <el-button
            title="Refresh companies"
            @click="refreshData"
            :icon="ElIconRefresh"
          />
        </template>
      </el-page-header>
    </template>

    <div
      v-loading="isPending"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2 p-2"
    >
      <el-card v-for="row in data" :key="row.id" shadow="hover" class="h-full">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div
                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                {{ row.code }}
              </div>
              <div class="truncate text-lg font-semibold text-gray-800">
                {{ row.name }}
              </div>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <el-tag v-if="row.isDefault" type="success" effect="plain">
                Default
              </el-tag>
              <el-dropdown>
                <el-button
                  link
                  :icon="ElIconMoreFilled"
                  title="Company actions"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :icon="ElIconEdit" @click="openForm(row)">
                      Edit
                    </el-dropdown-item>
                    <el-dropdown-item
                      :icon="ElIconDelete"
                      @click="handleRemove(row.id, remove)"
                      class="text-red-500!"
                    >
                      Delete
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <div
              class="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400"
            >
              <el-icon><ElIconLocation /></el-icon>
              Address
            </div>
            <el-card shadow="never">
              <div class="whitespace-pre-line">
                {{ row.address || "No address provided" }}
              </div>
              <div v-if="row.phone">Phone: {{ row.phone }}</div>
            </el-card>
          </div>

          <div>
            <div
              class="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400"
            >
              <el-icon><ElIconCreditCard /></el-icon>
              Bank accounts
            </div>
            <bank-cards v-if="row.banks?.length > 0" :banks="row.banks || []" />
            <div v-else class="text-sm italic text-gray-400">
              No bank accounts provided
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <CompanyForm />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const defaultData = {
  banks: [
    {
      name: "",
      branch: "",
      accountNumber: "",
      accountName: "",
    },
  ],
};

const { openForm, removeMutation, fetchData, refreshData, handleRemove } =
  useCrud({
    url: "/api/companies",
    queryKey: "companies",
  });

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
