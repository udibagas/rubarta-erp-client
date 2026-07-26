<template>
  <div class="sidebar">
    <!-- Collapse Button -->
    <div class="collapse-btn-wrapper">
      <el-button
        :icon="collapse ? ElIconExpand : ElIconFold"
        circle
        @click="$emit('toggle-collapse')"
        class="collapse-btn"
      />
    </div>

    <el-menu
      :default-active="activeMenu"
      :collapse="collapse"
      :default-openeds="defaultOpeneds"
      router
    >
      <template v-for="menu in visibleMenus" :key="menu.label">
        <!-- Menu without children -->
        <el-menu-item v-if="!menu.children" :index="menu.path">
          <el-icon>
            <component :is="menu.icon" />
          </el-icon>
          <template #title>{{ menu.label }}</template>
        </el-menu-item>

        <!-- Menu with children -->
        <el-sub-menu v-else :index="menu.path">
          <template #title>
            <el-icon>
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.label }}</span>
          </template>
          <el-menu-item
            v-for="child in menu.children"
            v-show="child.visible"
            :key="child.label"
            :index="child.path"
          >
            <el-icon>
              <component :is="child.icon" />
            </el-icon>
            <template #title>{{ child.label }}</template>
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>

    <!-- User Info at Bottom -->
    <div class="user-info" :class="{ collapsed: collapse }">
      <el-avatar
        :size="collapse ? 32 : 40"
        :style="{ backgroundColor: getAvatarColor(user?.name || '') }"
      >
        {{ user?.name?.charAt(0).toUpperCase() }}
      </el-avatar>
      <div v-if="!collapse" class="user-details">
        <div class="user-name">{{ user?.name }}</div>
        <div class="user-role">{{ user?.roles?.[0] || "User" }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth();
const { collapse } = defineProps(["collapse"]);
const emit = defineEmits(["toggle-collapse"]);
const route = useRoute();

// Get active menu based on current route
const activeMenu = computed(() => route.path);

// Default opened submenus (open first submenu by default when not collapsed)
const defaultOpeneds = computed(() => {
  if (collapse) return [];
  const menusWithChildren =
    menus.value?.filter((m) => m.children && m.visible) || [];
  return menusWithChildren.length > 0 && menusWithChildren[0]?.path
    ? [menusWithChildren[0].path]
    : [];
});

// Filter visible menus based on user roles
const visibleMenus = computed(() => {
  return menus.value.filter((menu) => menu.visible);
});

const menus = computed(() => [
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
    label: "CRM",
    path: "/crm",
    icon: ElIconCopyDocument,
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
        label: "Quotations",
        path: "/crm/quotations",
        icon: ElIconDocument,
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
    ],
  },
  {
    label: "Master Data",
    icon: ElIconCoin,
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
        icon: ElIconMenu,
        visible: true,
      },
      {
        label: "Banks",
        path: "/master-data/banks",
        icon: ElIconMoney,
        visible: true,
      },
      {
        label: "Vendors",
        path: "/master-data/suppliers",
        icon: ElIconConnection,
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
        icon: ElIconOperation,
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
.sidebar {
  height: 100%;
  overflow-y: auto;
  background-color: #1f2937;
  display: flex;
  flex-direction: column;
}

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

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #111827;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.user-info.collapsed {
  justify-content: center;
  padding: 1rem 0.5rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #f3f4f6;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
