<template>
  <el-menu
    router
    :collapse="collapse"
    :default-active="$route.path"
    class="sidebar"
  >
    <template v-for="(m, i) in links.filter((l) => l.visible)" :key="i">
      <el-sub-menu v-if="m.children" :index="m.path">
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
    // visible: !(user.value.roles.length == 1 && user.value.roles[0] == "USER"),
    visible: true,
    children: [
      {
        label: "NKP",
        path: "/nkp",
        icon: ElIconDocumentCopy,
        visible: true,
      },
      // {
      //   label: "Expense Notes",
      //   path: "/expense-notes",
      //   icon: ElIconMemo,
      //   visible: true,
      // },
      {
        label: "Report",
        path: "/report",
        icon: ElIconPieChart,
        visible: true,
      },
    ],
  },
  {
    label: "CRM",
    path: "/crm",
    icon: ElIconCopyDocument,
    visible: true,
    children: [
      {
        label: "Dashboard",
        path: "/crm/dashboard",
        icon: ElIconDataAnalysis,
        visible: true,
      },
      {
        label: "Customers",
        path: "/crm/customers",
        icon: ElIconConnection,
        visible: true,
      },
      {
        label: "Contacts",
        path: "/crm/contacts",
        icon: ElIconPhone,
        visible: true,
      },
      {
        label: "Leads",
        path: "/crm/leads",
        icon: ElIconFilter,
        visible: true,
      },
      {
        label: "Opportunities",
        path: "/crm/opportunities",
        icon: ElIconOpportunity,
        visible: true,
      },
      {
        label: "Tasks",
        path: "/crm/tasks",
        icon: ElIconMemo,
        visible: true,
      },
      {
        label: "Interactions",
        path: "/crm/interactions",
        icon: ElIconSwitch,
        visible: true,
      },
      {
        label: "Orders",
        path: "/crm/orders",
        icon: ElIconShoppingCart,
        visible: true,
      },
      {
        label: "Invoices",
        path: "/crm/invoices",
        icon: ElIconDocument,
        visible: true,
      },
    ],
  },
  {
    label: "Master Data",
    icon: ElIconCoin,
    path: "/master-data",
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
        label: "Employees",
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
