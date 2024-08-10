<template>
  <el-menu
    router
    :collapse="collapse"
    :default-active="$route.path"
    class="sidebar"
  >
    <el-menu-item
      v-for="(m, i) in links.filter((l) => l.visible)"
      :index="m.path"
      :key="i"
    >
      <el-icon><component :is="icon[m.icon]" /></el-icon>
      <span slot="title"> {{ m.label }} </span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
const { user } = useSanctumAuth();
const { collapse } = defineProps(["collapse"]);

import {
  User,
  HomeFilled,
  Operation,
  DocumentCopy,
  CreditCard,
  DataAnalysis,
  Setting,
  Coin,
  Memo,
  DataLine,
  Stamp,
} from "@element-plus/icons-vue";

const icon = {
  User,
  HomeFilled,
  Operation,
  DocumentCopy,
  CreditCard,
  DataAnalysis,
  Setting,
  Coin,
  Memo,
  DataLine,
  Stamp,
};

const links = [
  {
    label: "Dashboard",
    path: "/",
    icon: "DataLine",
    visible: true,
  },
  {
    label: "NKP",
    path: "/nkp",
    icon: "Stamp",
    visible: !(user.value.roles.length == 1 && user.value.roles[0] == "USER"),
  },
  {
    label: "NKP Declaration",
    path: "/nkp-declaration",
    icon: "DocumentCopy",
    visible: true,
  },
  {
    label: "Expense Notes",
    path: "/expense-notes",
    icon: "Memo",
    visible: true,
  },
  {
    label: "Report",
    path: "/report",
    icon: "Memo",
    visible: true,
  },
  {
    label: "Master Data",
    path: "/master-data/companies",
    icon: "Coin",
    visible: user.value.roles.includes("ADMIN"),
  },
];
</script>
