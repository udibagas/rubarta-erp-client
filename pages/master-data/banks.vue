<template>
  <div class="text-right">
    <el-button
      size="small"
      :icon="Plus"
      @click="bankStore.openForm()"
      type="success"
    >
      ADD NEW BANK
    </el-button>
  </div>

  <br />

  <el-table :data="bankStore.banks" v-loading="bankStore.loading" stripe>
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
        <el-button link @click="bankStore.requestData" :icon="Refresh">
        </el-button>
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
                @click.native.prevent="bankStore.openForm(row)"
              >
                Edit
              </el-dropdown-item>
              <el-dropdown-item
                :icon="Delete"
                @click.native.prevent="bankStore.remove(row.id)"
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

const bankStore = useBankStore();

onMounted(() => {
  bankStore.requestData();
});
</script>
