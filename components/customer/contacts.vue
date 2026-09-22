<template>
  <el-table :data="customer?.Contacts ?? []" stripe>
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
          class="text-gray-400!"
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
  </el-table>
</template>

<script setup>
defineProps(["customer"]);
</script>
