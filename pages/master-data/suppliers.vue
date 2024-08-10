<template>
  <form class="flex justify-content-end" @submit.prevent="refreshData()">
    <el-button
      size="small"
      @click="openForm({ roles: ['USER'], password: '' })"
      type="success"
      :icon="ElIconPlus"
      class="mr-2"
    >
      ADD NEW VENDOR
    </el-button>
    <el-input
      size="small"
      v-model="keyword"
      placeholder="Cari"
      style="width: 180px"
      :prefix-icon="ElIconSearch"
      :clearable="true"
      @clear="refreshData()"
    >
    </el-input>
  </form>

  <br />

  <el-table stripe v-loading="isPending" :data="data">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Code" min-width="150">
      <template #default="{ row }">
        <strong>{{ row.code }}</strong>
      </template>
    </el-table-column>

    <el-table-column label="Name" min-width="150">
      <template #default="{ row }">
        <strong>{{ row.name }}</strong>
      </template>
    </el-table-column>

    <el-table-column label="Address" prop="address" min-width="150" />
    <el-table-column label="Phone" prop="phone" min-width="150" />
    <el-table-column label="Email" prop="email" min-width="150" />

    <el-table-column label="Bank" min-width="150">
      <template #default="{ row }">
        {{ row.Bank?.name }} <br />
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
  url: "/api/suppliers",
  queryKey: "suppliers",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
