<template>
  <div class="sidebar">
    <ul class="menu w-full">
      <li v-for="(menu, index) in visibleMenus" :key="menu.name">
        <nuxt-link
          v-if="!menu.children"
          :to="menu.path"
          active-class="menu-active"
          class="flex items-center gap-2"
          :class="{ 'justify-center': collapse }"
        >
          <component :is="menu.icon" class="w-4 h-4" />
          <span v-show="!collapse">{{ menu.label }}</span>
        </nuxt-link>
        <details v-else :open="!collapse && index === 0">
          <summary
            class="flex items-center gap-2"
            :class="{ 'justify-center': collapse }"
          >
            <component :is="menu.icon" class="w-4 h-4" />
            <span v-show="!collapse">{{ menu.label }}</span>
          </summary>
          <ul v-show="!collapse">
            <li v-for="child in menu.children" :key="child.label">
              <nuxt-link
                v-if="child.visible"
                :to="child.path"
                exact-active-class="menu-active"
                class="flex items-center gap-2 pl-6"
              >
                <component :is="child.icon" class="w-3 h-3" />
                {{ child.label }}
              </nuxt-link>
            </li>
          </ul>
        </details>
      </li>
    </ul>
  </div>
</template>

<script setup>
const { user } = useAuth();
const { collapse } = defineProps(["collapse"]);
const route = useRoute();

// Function to check if a submenu should be open based on current route
const isSubMenuOpen = (menuPath) => {
  return route.path.startsWith(menuPath) && menuPath !== "/";
};

// Filter visible menus based on user roles
const visibleMenus = computed(() => {
  return menus.filter((menu) => menu.visible);
});

const menus = [
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
        visible: user.value.roles.includes("ADMIN"),
      },
    ],
  },
  {
    label: "CRM",
    path: "/crm",
    icon: ElIconCopyDocument,
    visible: user.value.roles.includes("ADMIN"),
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
];
</script>

<style scoped>
.sidebar {
  height: 100%;
  overflow-y: auto;
  padding: 0.5rem;
}

.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.menu {
  --menu-active-fg: #ffffff;
  --menu-active-bg: #019932;
  border-radius: 0.5rem;
}

/* Menu item styling */
:deep(.menu li) {
  margin-bottom: 0.25rem;
}

:deep(.menu li > *) {
  border-radius: 0.5rem;
  margin: 0;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.menu li > a) {
  color: #374151;
  padding: 0.75rem 1rem;
}

:deep(.menu li > a:hover) {
  background-color: #f3f4f6;
  color: #019932;
}

:deep(.menu li > a.menu-active) {
  background-color: #019932;
  color: #ffffff;
  font-weight: 600;
}

/* Submenu styling */
:deep(.menu details) {
  margin-bottom: 0.25rem;
}

:deep(.menu details > summary) {
  color: #374151;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.menu details > summary:hover) {
  background-color: #f3f4f6;
  color: #019932;
}

:deep(.menu details[open] > summary) {
  background-color: #f9fafb;
  color: #019932;
  font-weight: 600;
}

:deep(.menu details ul) {
  padding: 0.25rem 0;
  margin-top: 0.25rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

:deep(.menu details ul li) {
  margin-bottom: 0.125rem;
}

:deep(.menu details ul li > a) {
  color: #6b7280;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

:deep(.menu details ul li > a:hover) {
  background-color: #f3f4f6;
  color: #019932;
}

:deep(.menu details ul li > a.menu-active) {
  background-color: #019932;
  color: #ffffff;
  font-weight: 600;
}

/* Icon styling */
:deep(.menu .w-4) {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

:deep(.menu .w-3) {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}
</style>
