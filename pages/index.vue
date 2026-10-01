<template>
  <nuxt-layout name="default">
    <template #header>
      <div class="flex justify-between items-center">
        <div>
          <p
            class="text-sm font-medium uppercase tracking-widest text-green-700"
          >
            Workspace overview
          </p>
          <h1 class="mt-1 text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p class="mt-1 text-sm text-gray-500">
            Keep track of today's visits, approvals, and tasks.
          </p>
        </div>
        <div>
          <div class="text-sm text-gray-500">{{ formatDate(new Date()) }}</div>
        </div>
      </div>
    </template>

    <DashboardOverview />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({ layout: false });
</script>
