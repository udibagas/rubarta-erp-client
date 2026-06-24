<template>
  <el-page-header @back="goBack" content="CRM / Interactions">
    <template #extra>
      <form
        class="flex gap-2"
        @submit.prevent="
          () => {
            page = 1;
            refreshData();
          }
        "
      >
        <el-input
          v-model="keyword"
          placeholder="Cari"
          style="width: 180px"
          :prefix-icon="ElIconSearch"
          :clearable="true"
          @clear="
            () => {
              page = 1;
              refreshData();
            }
          "
        />
        <el-button :icon="ElIconPlus" type="success" @click="openForm()" />
      </form>
    </template>
  </el-page-header>

  <br />

  <el-table stripe v-loading="isPending" :data="data">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Customer" prop="Customer.name" width="220" />
    <el-table-column label="User" prop="User.name" width="200" />
    <el-table-column
      label="Type"
      prop="type"
      width="120"
      align="center"
      header-align="center"
    >
      <template #default="{ row }">
        <StatusTag :status="row.type" effect="dark" />
      </template>
    </el-table-column>
    <el-table-column label="Date" prop="date" width="120">
      <template #default="{ row }">
        {{ formatDate(row.date) }}
      </template>
    </el-table-column>
    <el-table-column label="Notes" prop="notes" />
    <el-table-column label="Last Update" prop="updatedAt" width="150">
      <template #default="{ row }">
        {{ formatDate(row.updatedAt) }} {{ formatTime(row.updatedAt) }}
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

  <InteractionForm />
</template>

<script setup>
const {
  openForm,
  removeMutation,
  fetchData,
  refreshData,
  handleRemove,
  keyword,
  page,
} = useCrud({
  url: "/api/interactions",
  queryKey: "interactions",
});

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
