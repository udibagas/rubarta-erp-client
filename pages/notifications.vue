<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600"> NOTIFICATIONS </span>
    </template>
    <template #extra>
      <form @submit.prevent="searchData">
        <el-input
          size="small"
          v-model="keyword"
          placeholder="Cari"
          style="width: 180px"
          :prefix-icon="Search"
          :clearable="true"
        >
        </el-input>
      </form>
    </template>
  </el-page-header>

  <br />

  <div class="flex">
    <el-table stripe v-loading="loading" :data="tableData" style="width: 400px">
      <el-table-column label="Message" min-width="150">
        <template #default="{ row }">
          {{ formatDate(row.date) }}
          <h3>{{ row.title }}</h3>
        </template>
      </el-table-column>
    </el-table>

    <div class="preview flex-grow">ini nanti preview message-nya</div>
  </div>
</template>

<script setup>
const store = useWebsiteStore();
import { Refresh, Delete, Search } from "@element-plus/icons-vue";
const { tableData, loading, keyword, requestData, searchData, refreshData } =
  useCrud("/api/notifications");

onMounted(() => {
  requestData();
});
</script>
