<template>
  <el-menu
    router
    :default-active="$route.path"
    class="el-menu-demo"
    mode="horizontal"
  >
    <el-menu-item
      v-for="(l, i) in links"
      :index="`/master-data/${l.path}`"
      :key="i"
    >
      {{ l.label }}
    </el-menu-item>
  </el-menu>
  <br />
  <NuxtPage />
</template>

<script setup>
const links = [
  {
    label: "Companies",
    path: "companies",
  },
  {
    label: "Departments",
    path: "departments",
  },
  {
    label: "Banks",
    path: "banks",
  },
  {
    label: "Expense Types",
    path: "expense-types",
  },
  {
    label: "Users",
    path: "users",
  },
  {
    label: "Approval Setting",
    path: "approval-setting",
  },
];
</script>
