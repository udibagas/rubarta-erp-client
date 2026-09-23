<template>
  <div
    ref="menuContainer"
    class="h-[calc(100dvh-133px)] flex flex-col overflow-auto"
  >
    <ul class="menu bg-[#1F2836] text-gray-200 w-full">
      <template v-for="m in visibleMenus" :key="m.path">
        <li v-if="!m.children">
          <nuxt-link
            :to="m.path"
            active-class="menu-active"
            :class="{ 'tooltip tooltip-right': collapse }"
            :data-tip="m.label"
          >
            <component :is="m.icon" class="h-5 w-5 mr-1" />
            <span v-if="!collapse">{{ m.label }}</span>
          </nuxt-link>
        </li>

        <li v-else class="menu-title uppercase text-gray-500">
          {{ collapse ? "--" : m.label }}
        </li>

        <li
          v-for="ch in m.children?.filter((c) => c.visible) ?? []"
          :key="ch.path"
        >
          <nuxt-link
            :to="ch.path"
            active-class="menu-active"
            :class="{ 'tooltip tooltip-right': collapse }"
            :data-tip="ch.label"
          >
            <component :is="ch.icon" class="h-5 w-5 mr-1" />
            <span v-if="!collapse">{{ ch.label }}</span>
          </nuxt-link>
        </li>
      </template>
    </ul>
  </div>

  <!-- User Info at Bottom -->
  <div
    class="flex items-center gap-3 p-4 bg-gray-900 border-t border-white/10 mt-auto"
    :class="{ 'justify-center py-4 px-2': collapse }"
  >
    <el-avatar
      v-if="!collapse"
      :size="40"
      :style="{ backgroundColor: getAvatarColor(user?.name || '') }"
    >
      {{ user?.name?.charAt(0).toUpperCase() }}
    </el-avatar>
    <div v-if="!collapse" class="flex-1 min-w-0">
      <div
        class="font-semibold text-gray-100 text-sm whitespace-nowrap overflow-hidden text-ellipsis"
      >
        {{ user?.name }}
      </div>
      <div
        class="text-xs text-gray-400 capitalize whitespace-nowrap overflow-hidden text-ellipsis"
      >
        {{ user?.roles?.[0] || "User" }}
      </div>
    </div>

    <el-button
      :icon="collapse ? ElIconArrowRight : ElIconArrowLeft"
      circle
      @click="$emit('toggle-collapse')"
      class="collapse-btn"
    />
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth();
const { collapse } = defineProps(["collapse"]);
const emit = defineEmits(["toggle-collapse"]);

// Filter visible menus based on user roles
const visibleMenus = computed(() => {
  return menus.value.filter((menu) => menu.visible);
});

const menus = computed(() => [
  {
    label: "Dashboard",
    path: "/",
    icon: ElIconOdometer,
    visible: true,
  },
  {
    label: "NKP",
    path: "/nkp",
    icon: ElIconTickets,
    visible: true,
    children: [
      {
        label: "NKP",
        path: "/nkp",
        icon: ElIconDocumentCopy,
        visible: true,
      },
      {
        label: "Employee Balance",
        path: "/employee-balance",
        icon: ElIconMoney,
        visible: true,
      },
      {
        label: "Report",
        path: "/report",
        icon: ElIconPieChart,
        visible: hasRole(["ADMIN"]),
      },
    ],
  },
  {
    label: "Master Data",
    icon: ElIconGrid,
    path: "/master-data",
    visible: hasRole(["ADMIN"]),
    children: [
      {
        label: "Companies",
        path: "/master-data/companies",
        icon: ElIconOfficeBuilding,
        visible: true,
      },
      {
        label: "Departments",
        path: "/master-data/departments",
        icon: ElIconSetUp,
        visible: true,
      },
      {
        label: "Banks",
        path: "/master-data/banks",
        icon: ElIconWallet,
        visible: true,
      },
      {
        label: "Vendors",
        path: "/master-data/suppliers",
        icon: ElIconShop,
        visible: true,
      },
      {
        label: "Materials",
        path: "/master-data/materials",
        icon: ElIconBox,
        visible: true,
      },
      {
        label: "Employees",
        path: "/master-data/users",
        icon: ElIconUser,
        visible: true,
      },
      {
        label: "Approval Setting",
        path: "/master-data/approval-setting",
        icon: ElIconCircleCheck,
        visible: true,
      },
    ],
  },
  {
    label: "CRM",
    path: "/crm",
    icon: ElIconService,
    visible: hasRole(["SALES_REP", "ADMIN"]),
    children: [
      {
        label: "Dashboard",
        path: "/crm/dashboard",
        icon: ElIconDataAnalysis,
        visible: true,
      },

      {
        label: "Visit Plan",
        path: "/crm/visit-plan",
        icon: ElIconCalendar,
        visible: true,
      },

      {
        label: "Prospects",
        path: "/crm/leads",
        icon: ElIconAim,
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
        icon: ElIconChatDotRound,
        visible: true,
      },
      {
        label: "Customers",
        path: "/crm/customers",
        icon: ElIconAvatar,
        visible: true,
      },
      {
        label: "Contacts",
        path: "/crm/contacts",
        icon: ElIconPhone,
        visible: true,
      },
    ],
  },
  {
    label: "Sales",
    icon: ElIconShoppingCartFull,
    path: "/sales",
    visible: hasRole(["ADMIN", "SALES_REP"]),
    children: [
      {
        label: "Quotations",
        path: "/sales/quotations",
        icon: ElIconDocument,
        visible: true,
      },
      {
        label: "Sales Orders",
        path: "/sales/orders",
        icon: ElIconShoppingCart,
        visible: true,
      },
      {
        label: "Invoices",
        path: "/sales/invoices",
        icon: ElIconCreditCard,
        visible: true,
      },
    ],
  },
  {
    label: "Purchase Orders",
    icon: ElIconShoppingTrolley,
    path: "/purchasing-logistics",
    visible: hasRole(["ADMIN"]),
    children: [
      {
        label: "Purchase Orders",
        path: "/purchasing-logistics/purchase-orders",
        icon: ElIconDocument,
        visible: true,
      },
      {
        label: "Goods Receipts",
        path: "/purchasing-logistics/goods-receipts",
        icon: ElIconGoods,
        visible: true,
      },
      {
        label: "Delivery Orders",
        path: "/purchasing-logistics/delivery-orders",
        icon: ElIconVan,
        visible: true,
      },
    ],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: ElIconHistogram,
    visible: true,
    children: [
      {
        label: "Sales Dashboard",
        path: "/reports/sales-dashboard",
        icon: ElIconOdometer,
        visible: true,
      },
      {
        label: "Sales Report",
        path: "/reports/sales-report",
        icon: ElIconTrendCharts,
        visible: true,
      },
      {
        label: "Aging Report",
        path: "/reports/aging-report",
        icon: ElIconTimer,
        visible: true,
      },
      {
        label: "Purchase Report",
        path: "/reports/purchase-report",
        icon: ElIconPieChart,
        visible: true,
      },
      {
        label: "Outstanding Purchase Order",
        path: "/reports/outstanding-purchase-order",
        icon: ElIconWarning,
        visible: true,
      },
      {
        label: "Outstanding Back Order",
        path: "/reports/outstanding-back-order",
        icon: ElIconWarningFilled,
        visible: true,
      },
    ],
  },
]);

function hasRole(roles: string[]): boolean {
  return roles.some((role) => user.value?.roles?.includes(role));
}
</script>

<style scoped>
.collapse-btn-wrapper {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  background-color: #1f2937;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-btn {
  background-color: rgba(55, 65, 81, 0.5);
  border: none;
  color: #d1d5db;
}

.collapse-btn:hover {
  background-color: rgba(55, 65, 81, 0.8);
  color: #f3f4f6;
}

:deep(.el-menu) {
  border-right: none;
  background-color: #1f2937;
  color: #d1d5db;
  flex: 1;
  overflow-y: auto;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: #d1d5db;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(55, 65, 81, 0.8);
  color: #f3f4f6;
}

:deep(.el-sub-menu .el-menu) {
  background-color: #111827;
}

:deep(.el-sub-menu .el-menu-item) {
  background-color: #111827;
}

:deep(.el-sub-menu .el-menu-item:hover) {
  background-color: rgba(55, 65, 81, 0.6);
}
</style>
