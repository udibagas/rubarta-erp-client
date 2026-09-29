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
                    branch: '',
                    accountNumber: '',
                    accountName: '',
                  },
                ],
              })
            "
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
              class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400"
            >
              <el-icon><ElIconLocation /></el-icon>
              Address
            </div>
            <div class="whitespace-pre-line text-sm text-gray-600">
              {{ row.address || "No address provided" }}
            </div>
            <div v-if="row.phone" class="mt-1 text-sm text-gray-500">
              Phone: {{ row.phone }}
            </div>
          </div>

          <div>
            <div
              class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400"
            >
              <el-icon><ElIconCreditCard /></el-icon>
              Bank accounts
            </div>
            <div v-if="row.banks?.length" class="space-y-2">
              <div
                v-for="bank in row.banks"
                :key="bank.accountNumber"
                class="rounded border border-gray-200 bg-gray-50 px-3 py-2 hover:bg-green-50 hover:border-green-500"
              >
                <div class="flex justify-between gap-2">
                  <div class="line-clamp-1 font-semibold text-gray-800">
                    {{ bank.accountName }}
                  </div>
                  <el-tag
                    v-if="bank.isPrimary"
                    type="success"
                    plain
                    size="small"
                  >
                    Primary
                  </el-tag>
                </div>
                <div class="font-mono text-sm tabular-nums text-gray-600">
                  Acc No. {{ bank.accountNumber }}
                </div>
                <div
                  class="text-xs font-medium uppercase tracking-wide text-gray-400"
                >
                  {{ bank.name }} - {{ bank.branch }}
                </div>
              </div>
            </div>
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
