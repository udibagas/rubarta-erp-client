<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Vendors">
        <template #extra>
          <form @submit.prevent="refreshData()" class="flex gap-2">
            <el-input
              v-model="keyword"
              placeholder="Search by name, code, or address..."
              clearable
              style="width: 300px"
              :prefix-icon="ElIconSearch"
              @clear="refreshData()"
            />
            <el-button :icon="ElIconPlus" type="success" @click="openForm()">
              ADD NEW VENDOR
            </el-button>
          </form>
        </template>
      </el-page-header>
    </template>
    <el-table
      stripe
      v-loading="isPending"
      :data="data"
      height="calc(100vh - 155px)"
    >
      <el-table-column type="index" label="#"></el-table-column>

      <el-table-column label="Name" min-width="250px">
        <template #default="{ row }">
          <strong>{{ row.name }}</strong> <br />
          {{ row.code }}
        </template>
      </el-table-column>

      <el-table-column label="Contact" width="250px">
        <template #default="{ row }">
          <div class="flex gap-2 items-center">
            <el-icon><ElIconPhone /></el-icon> {{ row.phone || "-" }}
          </div>
          <div class="flex gap-2 items-center">
            <el-icon><ElIconMessage /></el-icon>
            <el-link
              type="success"
              :href="`mailto:${row.email}`"
              target="_blank"
            >
              {{ row.email || "-" }}
            </el-link>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Address" min-width="300px">
        <template #default="{ row }">
          {{ row.address }}
        </template>
      </el-table-column>

      <el-table-column label="Bank" min-width="250px">
        <template #default="{ row }">
          <strong>{{ row.Bank?.name }}</strong> <br />
          {{ row.bankAccount }} ({{ row.currency }})
        </template>
      </el-table-column>

      <el-table-column
        width="60px"
        align="center"
        header-align="center"
        fixed="right"
      >
        <template #header>
          <el-button link @click="refreshData()" :icon="ElIconRefresh">
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

    <SupplierForm />
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
  keyword,
} = useCrud({
  url: "/api/suppliers",
  queryKey: "suppliers",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
