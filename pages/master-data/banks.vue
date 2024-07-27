<template>
  <div class="text-right">
    <el-button size="small" :icon="Plus" @click="openForm()" type="success">
      ADD NEW BANK
    </el-button>
  </div>

  <br />

  <el-table :data="data" v-loading="isPending" stripe>
    <el-table-column type="index" label="#"></el-table-column>
    <el-table-column min-width="100" label="Code" prop="code"></el-table-column>
    <el-table-column min-width="100" label="Name" prop="name"></el-table-column>

    <el-table-column
      fixed="right"
      width="60px"
      align="center"
      header-align="center"
    >
      <template #header>
        <el-button link @click="refreshData" :icon="Refresh"> </el-button>
      </template>
      <template #default="{ row }">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-icon>
              <MoreFilled />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                :icon="Edit"
                @click.native.prevent="openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="Delete"
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

  <BankForm />
</template>

<script setup>
import {
  Refresh,
  Plus,
  Edit,
  Delete,
  MoreFilled,
} from "@element-plus/icons-vue";

const { openForm, removeMutation, fetchData, refreshData, handleRemove } =
  useCrud({
    url: "/api/banks",
    queryKey: "banks",
  });

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
