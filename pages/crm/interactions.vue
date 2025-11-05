<template>
  <el-page-header @back="goBack" content="CRM / Interactions">
    <template #extra>
      <el-button
        size="small"
        :icon="ElIconPlus"
        type="success"
        @click="openForm()"
      >
        ADD NEW TASK
      </el-button>
    </template>
  </el-page-header>

  <br />

  <el-table stripe v-loading="isPending" :data="data">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Customer" prop="Customer.name" />
    <el-table-column label="User" prop="User.name" />
    <el-table-column label="Type" prop="type" />
    <el-table-column label="Date">
      <template #default="{ row }">
        {{ formatDate(row.date) }}
      </template>
    </el-table-column>
    <el-table-column label="Notes" prop="notes" />
    <el-table-column label="Last Update">
      <template #default="{ row }">
        {{ formatDate(row.updatedAt) }}
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

  <CustomerForm />
</template>

<script setup>
const { openForm, removeMutation, fetchData, refreshData, handleRemove } =
  useCrud({
    url: "/api/tasks",
    queryKey: "tasks",
  });

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
