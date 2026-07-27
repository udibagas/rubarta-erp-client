<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Employee Balance" />
    </template>

    <el-table
      :data="data"
      v-loading="isPending"
      stripe
      height="calc(100vh - 150px)"
    >
      <el-table-column label="Employee">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-avatar
              v-if="row.user.avatar"
              :src="row.user.avatar"
              size="small"
            />
            <el-avatar
              v-else
              size="small"
              class="shrink-0"
              :style="{ backgroundColor: getAvatarColor(row.user.name) }"
            >
              {{ row.user.name?.charAt(0).toUpperCase() }}
            </el-avatar>
            <span class="font-semibold text-sm line-clamp-1">
              {{ row.user.name }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Balance" align="right">
        <template #default="{ row }">
          <el-tag
            :type="row.balance > 0 ? 'danger' : 'success'"
            effect="plain"
            class="font-mono"
          >
            {{ toRupiah(row.balance) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Description" prop="description" min-width="150">
        <template #default="{ row }">
          <span class="font-mono line-clamp-1">{{ row.description }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Last Update">
        <template #default="{ row }">
          {{ formatDate(row.updatedAt) }} {{ formatTime(row.updatedAt) }}
        </template>
      </el-table-column>
    </el-table>
  </nuxt-layout>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";
const request = useRequest();

definePageMeta({
  layout: false,
});

const { isPending, data } = useQuery({
  queryKey: ["user-balance"],
  queryFn: () => request("/api/users/balance"),
});
</script>
