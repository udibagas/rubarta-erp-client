<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Vendors">
        <template #extra>
          <form @submit.prevent="refetch()" class="flex gap-2">
            <el-input
              v-model="keyword"
              placeholder="Search by name, code, or address..."
              clearable
              style="width: 300px"
              :prefix-icon="ElIconSearch"
              @clear="refetch()"
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
      :data="data?.data ?? []"
      height="calc(100vh - 195px)"
    >
      <el-table-column label="Name" prop="name">
        <template #default="{ row }">
          <div
            class="line-clamp-1 font-semibold cursor-pointer hover:underline"
            @click="openForm(row)"
          >
            {{ row.name }}
          </div>
          <span class="text-xs text-gray-500">
            {{ row.code }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Contact" prop="email">
        <template #default="{ row }">
          <el-link
            :href="`mailto:${row.email}`"
            target="_blank"
            class="line-clamp-1"
          >
            {{ row.email || "-" }}
          </el-link>
          <div class="text-xs text-gray-400">
            {{ row.phone || "-" }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Address">
        <template #default="{ row }">
          <div class="whitespace-pre-line line-clamp-3 text-xs">
            {{ row.address }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Bank" prop="Bank?.name">
        <template #default="{ row }">
          <div class="line-clamp-1">{{ row.Bank?.name }}</div>
          <div class="text-xs text-gray-400">
            {{ row.bankAccount }} ({{ row.currency }})
          </div>
        </template>
      </el-table-column>

      <el-table-column
        width="60px"
        align="center"
        header-align="center"
        fixed="right"
      >
        <template #header>
          <el-button link @click="refetch()" :icon="ElIconRefresh"> </el-button>
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

    <el-pagination
      class="p-2 bg-slate-100"
      v-if="data?.total"
      :current-page="page"
      size="small"
      background
      layout="total, sizes, prev, pager, next"
      :page-size="pageSize"
      :page-sizes="[10, 25, 50, 100]"
      :total="data?.total"
      @current-change="currentChange"
      @size-change="sizeChange"
    />

    <SupplierForm />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const {
  openForm,
  removeMutation,
  fetchData,
  handleRemove,
  currentChange,
  sizeChange,
  keyword,
  page,
  pageSize,
} = useCrud({
  url: "/api/suppliers",
  queryKey: "suppliers",
});

const { isPending, data, refetch } = fetchData();
const { mutate: remove } = removeMutation();
</script>
