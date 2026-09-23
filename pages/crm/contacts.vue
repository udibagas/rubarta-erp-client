<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Contacts">
        <template #extra>
          <div class="flex gap-2">
            <el-input
              v-model="keyword"
              placeholder="Search"
              @change="refetch()"
              clearable
              :prefix-icon="ElIconSearch"
              style="width: 200px"
            />
            <el-button :icon="ElIconPlus" type="success" @click="openForm()" />
          </div>
        </template>
      </el-page-header>
    </template>

    <el-table
      stripe
      v-loading="isPending"
      :data="data?.data ?? []"
      height="calc(100vh - 195px)"
    >
      <template #empty>
        <el-empty description="No Items"> </el-empty>
      </template>
      <el-table-column label="Name" prop="name" min-width="150">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-avatar
              class="shrink-0"
              :style="{ backgroundColor: getAvatarColor(row.name) }"
              :size="30"
            >
              {{ row.name?.charAt(0).toUpperCase() }}
            </el-avatar>
            <div>
              <span class="font-semibold text-sm line-clamp-1">
                {{ row.name }}
              </span>
              <span class="text-xs text-gray-400 line-clamp-1">
                {{ row.position }}
              </span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Customer" prop="Customer.name" min-width="150">
        <template #default="{ row }">
          <el-link :href="`/crm/customers/${row.Customer?.id}`" target="_blank">
            <el-icon>
              <ElIconOfficeBuilding />
            </el-icon>
            <span class="ml-1 line-clamp-1">
              {{ row.Customer?.name }}
            </span>
          </el-link>
        </template>
      </el-table-column>

      <el-table-column label="Contact" prop="phone" min-width="150">
        <template #default="{ row }">
          <el-link :href="`mailto:${row.email}`">
            {{ row.email }}
          </el-link>
          <br />
          <el-link
            v-if="row.phone"
            :href="`https://wa.me/${row.phone.replace(/[^0-9]/g, '')}`"
            target="_blank"
            class="text-xs! text-gray-400!"
          >
            {{ row.phone }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="Notes" prop="notes" />

      <el-table-column
        label="Is Primary"
        prop="isPrimary"
        min-width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag effect="plain" :type="row.isPrimary ? 'success' : 'info'">
            {{ row.isPrimary ? "Yes" : "No" }}
          </el-tag>
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

    <ContactForm />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });

const {
  openForm,
  removeMutation,
  fetchData,
  handleRemove,
  page,
  pageSize,
  keyword,
  sizeChange,
  currentChange,
} = useCrud({
  url: "/api/contacts",
  queryKey: "contacts",
});

const { isPending, data, refetch } = fetchData();
const { mutate: remove } = removeMutation();
</script>
