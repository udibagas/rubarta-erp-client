<template>
  <div class="text-right">
    <el-button size="small" :icon="Plus" @click="openForm()" type="success">
      ADD NEW EXPENSE TYPE
    </el-button>
  </div>

  <br />

  <el-table stripe :data="data" v-loading="isPending">
    <el-table-column type="index" label="#"></el-table-column>
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

  <ExpenseTypeForm />
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
    url: "/api/expense-types",
    queryKey: "expense-types",
  });

const { isPending, data } = fetchData();
const { mutate: remove } = removeMutation();
</script>
