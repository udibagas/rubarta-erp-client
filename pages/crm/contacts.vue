<template>
  <el-page-header @back="goBack" content="CRM / Contacts">
    <template #extra>
      <div class="flex gap-2">
        <el-input
          v-model="keyword"
          placeholder="Search"
          @change="refreshData()"
          clearable
          :prefix-icon="ElIconSearch"
          style="width: 200px"
        />
        <el-button :icon="ElIconPlus" type="success" @click="openForm()" />
      </div>
    </template>
  </el-page-header>

  <br />

  <el-table stripe v-loading="isPending" :data="data">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Name" prop="name" min-width="150">
      <template #default="{ row }">
        <div class="flex items-center gap-2">
          <el-avatar
            class="shrink-0"
            :size="28"
            :style="{ backgroundColor: getAvatarColor(row.name) }"
          >
            {{ row.name?.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="font-semibold text-sm line-clamp-1">{{ row.name }}</span>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Customer" prop="Customer.name" min-width="150">
      <template #default="{ row }">
        <el-link
          :href="`/crm/customers/${row.Customer?.id}`"
          target="_blank"
          type="success"
        >
          {{ row.Customer?.name }}
        </el-link>
      </template>
    </el-table-column>

    <el-table-column label="Phone" prop="phone" min-width="150">
      <template #default="{ row }">
        <a
          v-if="row.phone"
          :href="`https://wa.me/${row.phone.replace(/[^0-9]/g, '')}`"
          target="_blank"
          class="text-green-600 hover:underline"
        >
          {{ row.phone }}
        </a>
        <span v-else>-</span>
      </template>
    </el-table-column>

    <el-table-column label="Email" prop="email" min-width="150">
      <template #default="{ row }">
        <a :href="`mailto:${row.email}`" class="text-green-600 hover:underline">
          {{ row.email }}
        </a>
      </template>
    </el-table-column>

    <el-table-column label="Position" prop="position" min-width="150" />
    <el-table-column label="Note" prop="note" />

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

  <ContactForm />
</template>

<script setup>
const {
  openForm,
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  keyword,
} = useCrud({
  url: "/api/contacts",
  queryKey: "contacts",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
