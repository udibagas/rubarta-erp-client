<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Reports / Sales Report">
        <template #extra>
          <form class="flex gap-2" @submit.prevent>
            <el-input
              placeholder="Cari"
              style="width: 180px"
              :prefix-icon="ElIconSearch"
              :clearable="true"
            />
            <el-button type="success" :icon="ElIconPlus" />
          </form>
        </template>
      </el-page-header>
    </template>
    <div class="h-[calc(100vh-200px)] flex items-center justify-center">
      <el-empty description="Feature not implemented yet." />
    </div>
  </nuxt-layout>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: false,
});
</script>
