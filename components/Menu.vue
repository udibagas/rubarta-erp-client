<template>
  <el-menu
    router
    :collapse="collapse"
    :default-active="$route.path"
    class="sidebar"
  >
    <template v-for="(m, i) in links.filter((l) => l.visible)" :key="i">
      <el-sub-menu v-if="m.children">
        <template #title>
          <el-icon><component :is="m.icon"></component> </el-icon>
          <span slot="title"> {{ m.label }} </span>
        </template>
        <el-menu-item v-for="(sm, j) in m.children" :index="sm.path">
          <el-icon><component :is="sm.icon"></component> </el-icon>
          <span slot="title"> {{ sm.label }} </span>
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item :index="m.path" v-else>
        <el-icon><component :is="m.icon"></component> </el-icon>
        <span slot="title"> {{ m.label }} </span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup>
const { user } = useSanctumAuth();
const { collapse } = defineProps(["collapse"]);

const links = [
  {
    label: "Dashboard",
    path: "/",
    icon: ElIconDataLine,
    visible: true,
  },
  {
    label: "NKP",
    path: "/nkp",
    icon: ElIconTickets,
    visible: !(user.value.roles.length == 1 && user.value.roles[0] == "USER"),
  },
  {
    label: "NKP Declaration",
    path: "/nkp-declaration",
    icon: ElIconDocumentCopy,
    visible: true,
  },
  {
    label: "Expense Notes",
    path: "/expense-notes",
    icon: ElIconMemo,
    visible: true,
  },
  {
    label: "Report",
    path: "/report",
    icon: ElIconPieChart,
    visible: true,
  },
  {
    label: "Master Data",
    icon: ElIconCoin,
    visible: user.value.roles.includes("ADMIN"),
    children: [
      {
        label: "Companies",
        path: "/master-data/companies",
        icon: ElIconOfficeBuilding,
      },
      {
        label: "Departments",
        path: "/master-data/departments",
        icon: ElIconMenu,
      },
      {
        label: "Banks",
        path: "/master-data/banks",
        icon: ElIconMoney,
      },
      {
        label: "Vendors",
        path: "/master-data/suppliers",
        icon: ElIconConnection,
      },
      {
        label: "Expense Types",
        path: "/master-data/expense-types",
        icon: ElIconPriceTag,
      },
      {
        label: "Users",
        path: "/master-data/users",
        icon: ElIconUser,
      },
      {
        label: "Approval Setting",
        path: "/master-data/approval-setting",
        icon: ElIconOperation,
      },
    ],
  },
];
</script>
