<template>
  <div class="flex items-center justify-between gap-4 w-full">
    <div class="text-green-600 font-bold text-lg">RUBARTA ERP SYSTEM</div>

    <div class="flex items-center gap-2">
      <el-select
        v-model="search"
        placeholder="Search document number"
        filterable
        clearable
        remote
        reserve-keyword
        :remote-method="searchDocuments"
        :loading="loading"
        @change="openDocument"
        class="w-80! bg-gray-100!"
      >
        <template #prefix>
          <el-icon>
            <ElIconSearch />
          </el-icon>
        </template>
        <el-option-group
          v-for="group in options"
          :key="group.type"
          :label="group.label"
        >
          <el-option
            v-for="document in group.options"
            :key="`${document.type}:${document.id}`"
            :label="document.number"
            :value="`${document.type}:${document.id}`"
          >
            <div class="flex items-center justify-between gap-4">
              <span class="font-medium">{{ document.number }}</span>
              <span class="text-xs text-gray-500">
                {{ formatDocumentDate(document.date) }}
              </span>
            </div>
          </el-option>
        </el-option-group>
      </el-select>
      <el-select
        v-model="companyId"
        placeholder="Select Company"
        style="width: 270px"
        @change="(id) => changeCompany(id)"
      >
        <el-option
          v-for="c in companies"
          :key="c.id"
          :label="`${c.code} - ${c.name}`"
          :value="c.id"
        />
      </el-select>

      <el-dropdown>
        <el-button type="danger" :icon="ElIconPlus"> Create New </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="menu in menus"
              :key="menu.name"
              :icon="menu.icon"
              @click.native.prevent="navigateTo(menu.link)"
            >
              {{ menu.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-divider direction="vertical" />

      <el-popover placement="bottom-end" :width="360" trigger="click">
        <template #reference>
          <el-badge :value="unread ? unread : undefined" :max="10">
            <el-button
              text
              aria-label="Notifications"
              class="notification-trigger"
            >
              <el-icon :size="20">
                <ElIconBell />
              </el-icon>
            </el-button>
          </el-badge>
        </template>

        <div class="flex items-center justify-between gap-3 pb-3">
          <span class="font-semibold">Notifications</span>
          <div class="flex items-center gap-2">
            <el-button
              text
              type="primary"
              size="small"
              :disabled="!unread"
              :loading="markAllPending"
              @click="() => markAllAsRead()"
            >
              Mark all as read
            </el-button>
            <el-button
              text
              type="danger"
              size="small"
              :disabled="!notificationPage?.total"
              :loading="deleteAllPending"
              @click="confirmDeleteAll"
            >
              Delete all
            </el-button>
          </div>
        </div>

        <div v-loading="notificationsPending" class="notification-preview">
          <div
            v-for="notification in latestNotifications"
            :key="notification.id"
            class="notification-preview-item"
            :class="{ 'font-semibold': !notification.readAt }"
          >
            <NuxtLink
              :to="getNotificationLink(notification.redirectUrl)"
              class="notification-preview-content"
            >
              <span class="notification-preview-title">
                {{ notification.title }}
              </span>
              <span class="notification-preview-date">
                {{ formatNotificationDate(notification.date) }}
              </span>
            </NuxtLink>
            <el-button
              text
              type="danger"
              size="small"
              :icon="ElIconDelete"
              :loading="
                deleteNotificationPending &&
                deletingNotificationId === notification.id
              "
              aria-label="Delete notification"
              @click="() => deleteNotification(notification.id)"
            />
          </div>
          <el-empty
            v-if="!notificationsPending && !latestNotifications.length"
            description="No notifications"
            :image-size="48"
          />
        </div>

        <div class="border-t border-gray-200 pt-3 mt-3 text-center">
          <NuxtLink
            to="/notifications"
            class="text-sm block px-4 py-2 text-blue-600 hover:bg-gray-50"
          >
            View all notifications
          </NuxtLink>
        </div>
      </el-popover>

      <el-dropdown class="ml-4">
        <el-avatar
          :size="30"
          :style="{ backgroundColor: getAvatarColor(user?.name) }"
        >
          {{ user?.name[0] }}
        </el-avatar>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              :icon="ElIconUser"
              @click.native.prevent="showProfile = true"
            >
              My Profile
            </el-dropdown-item>
            <el-dropdown-item
              :icon="ElIconArrowRight"
              @click.native.prevent="handleClickLogout"
            >
              Sign Out
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <Profile :show="showProfile" @close="showProfile = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { gql } from "@apollo/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { documentTypeMeta } from "~/utils/documentType";
const emit = defineEmits(["toggle"]);
const shared = useSharedStore();
const { companyId } = storeToRefs(shared);
const request = useRequest();
const queryClient = useQueryClient();
const { user, logout } = useAuth();
const showProfile = ref(false);
const search = ref("");
const loading = ref(false);
interface SearchDocument {
  type: string;
  id: number;
  number: string;
  date: string;
}

const documents = ref<SearchDocument[]>([]);

const searchDocuments = async (keyword: string) => {
  loading.value = true;
  try {
    const res = await request<SearchDocument[]>(`/api/documents/search`, {
      params: {
        keyword,
      },
    });

    documents.value = res;
  } finally {
    loading.value = false;
  }
};

const normalizeDocumentType = (type: string) =>
  type.replace(/[^a-z0-9]/gi, "").toLowerCase();

const getDocumentTypeLabel = (type: string) => {
  if (normalizeDocumentType(type) === "nkp") return "NKP";

  const entry = Object.entries(documentTypeMeta).find(
    ([key]) => normalizeDocumentType(key) === normalizeDocumentType(type),
  );
  return entry?.[1].label ?? type;
};

const options = computed(() => {
  const groups = new Map<
    string,
    { type: string; label: string; options: SearchDocument[] }
  >();

  for (const document of documents.value) {
    const type = normalizeDocumentType(document.type);
    let group = groups.get(type);

    if (!group) {
      group = {
        type,
        label: getDocumentTypeLabel(document.type),
        options: [],
      };
      groups.set(type, group);
    }

    group.options.push(document);
  }

  return Array.from(groups.values());
});

const formatDocumentDate = (date: string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
    new Date(date),
  );

const openDocument = (value: string) => {
  const document = documents.value.find(
    (item) => `${item.type}:${item.id}` === value,
  );
  if (!document) return;

  const normalizedType = normalizeDocumentType(document.type);
  if (normalizedType === "nkp") {
    navigateTo({ path: "/nkp", query: { number: document.number } });
  } else {
    const entry = Object.entries(documentTypeMeta).find(
      ([key]) => normalizeDocumentType(key) === normalizedType,
    );
    if (entry) navigateTo(`${entry[1].route}/${document.id}`);
  }

  search.value = "";
};

interface Company {
  id: number;
  code: string;
  name: string;
  isDefault: boolean;
}

const { data } = await useGraphqlQuery<{ companies: Company[] }>(gql`
  query {
    companies {
      id
      code
      name
      isDefault
    }
  }
`);

const companies = computed(() => data?.companies ?? []);

// Set default company when companies data loads
watch(
  companies,
  (newCompanies) => {
    if (newCompanies && newCompanies.length > 0 && !companyId.value) {
      const defaultCompany = newCompanies.find((c) => c.isDefault);
      companyId.value = defaultCompany?.id ?? newCompanies?.[0]?.id ?? null;
    }
  },
  { immediate: true },
);

const { data: unread } = useQuery<number>({
  queryKey: ["unread-notifications"],
  queryFn: () => request("/api/notifications/unread"),
});

interface NotificationPreview {
  id: number;
  title: string;
  date: string;
  readAt: string | null;
  redirectUrl?: string | null;
}

interface NotificationPage {
  data: NotificationPreview[];
  total: number;
}

const { data: notificationPage, isPending: notificationsPending } =
  useQuery<NotificationPage>({
    queryKey: ["notification-preview"],
    queryFn: () =>
      request("/api/notifications", {
        params: { page: 1, pageSize: 5 },
      }),
  });

const latestNotifications = computed(() => notificationPage.value?.data ?? []);

const formatNotificationDate = (date: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

const getNotificationLink = (redirectUrl?: string | null) => {
  if (!redirectUrl) return "/notifications";

  try {
    const url = new URL(redirectUrl, "https://erp.rubarta.co.id");
    if (!["http:", "https:"].includes(url.protocol)) {
      return "/notifications";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/notifications";
  }
};

const { mutate: markAllAsRead, isPending: markAllPending } = useMutation({
  mutationFn: async () => {
    const pageSize = 100;
    const firstPage = await request<NotificationPage>("/api/notifications", {
      params: { page: 1, pageSize },
    });
    const pageCount = Math.ceil(firstPage.total / pageSize);
    const pages = await Promise.all(
      Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) =>
        request<NotificationPage>("/api/notifications", {
          params: { page: index + 2, pageSize },
        }),
      ),
    );
    const notifications = [firstPage, ...pages].flatMap((page) => page.data);

    await Promise.all(
      notifications
        .filter((notification) => !notification.readAt)
        .map((notification) =>
          request(`/api/notifications/${notification.id}`, {
            method: "PATCH",
          }),
        ),
    );
  },
  onSuccess: () => {
    ElMessage({
      message: "All notifications marked as read",
      type: "success",
      showClose: true,
    });
  },
  onError: (error) => {
    console.error("Failed to mark all notifications as read", error);
    ElMessage({
      message: "Failed to mark all notifications as read",
      type: "error",
      showClose: true,
    });
  },
  onSettled: async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] }),
      queryClient.invalidateQueries({ queryKey: ["notification-preview"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    ]);
  },
});

const {
  mutate: deleteNotification,
  variables: deletingNotificationId,
  isPending: deleteNotificationPending,
} = useMutation({
  mutationFn: (id: number) =>
    request(`/api/notifications/${id}`, { method: "DELETE" }),
  onSuccess: () => {
    ElMessage({
      message: "Notification deleted",
      type: "success",
      showClose: true,
    });
  },
  onError: (error) => {
    console.error("Failed to delete notification", error);
    ElMessage({
      message: "Failed to delete notification",
      type: "error",
      showClose: true,
    });
  },
  onSettled: async () => {
    await invalidateNotificationQueries();
  },
});

const { mutate: deleteAllNotifications, isPending: deleteAllPending } =
  useMutation({
    mutationFn: () => request("/api/notifications", { method: "DELETE" }),
    onSuccess: () => {
      ElMessage({
        message: "All notifications deleted",
        type: "success",
        showClose: true,
      });
    },
    onError: (error) => {
      console.error("Failed to delete all notifications", error);
      ElMessage({
        message: "Failed to delete all notifications",
        type: "error",
        showClose: true,
      });
    },
    onSettled: async () => {
      await invalidateNotificationQueries();
    },
  });

const invalidateNotificationQueries = async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["unread-notifications"] }),
    queryClient.invalidateQueries({ queryKey: ["notification-preview"] }),
    queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  ]);
};

const confirmDeleteAll = () => {
  ElMessageBox.confirm(
    "Are you sure you want to delete all notifications?",
    "Delete all notifications",
    {
      type: "warning",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    },
  )
    .then(() => deleteAllNotifications())
    .catch(() => {});
};

const { mutate: changeCompany } = useMutation({
  mutationFn: (id: number | string) => {
    companyId.value = id;
    return request(`/api/companies/set/${id}`, { method: "POST" });
  },
});

const handleClickLogout = () => {
  ElMessageBox.confirm("Anda yakin ingin keluar?", "Konfirmasi", {
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    type: "warning",
  })
    .then(() => logout())
    .catch(() => console.log("Action cancelled"));
};

const menus = [
  { name: "NKP", link: "/nkp?new=true", icon: ElIconDocumentCopy },
  {
    name: "Quotation",
    link: "/sales/quotations?new=true",
    icon: ElIconDocument,
  },
  {
    name: "Sales Order",
    link: "/sales/orders?new=true",
    icon: ElIconShoppingCart,
  },
  { name: "Invoice", link: "/sales/invoices?new=true", icon: ElIconCreditCard },
  {
    name: "Purchase Order",
    link: "/purchasing-logistics/purchase-orders?new=true",
    icon: ElIconShoppingCart,
  },
  {
    name: "Goods Receipt",
    link: "/purchasing-logistics/goods-receipts?new=true",
    icon: ElIconGoods,
  },
  {
    name: "Delivery Order",
    link: "/purchasing-logistics/delivery-orders?new=true",
    icon: ElIconVan,
  },
  {
    name: "Visit Plan",
    link: "/crm/visit-plan?new=true",
    icon: ElIconCalendar,
  },
  {
    name: "Task",
    link: "/crm/tasks?new=true",
    icon: ElIconMemo,
  },
];
</script>

<style scoped>
.notification-trigger {
  color: inherit;
}

.notification-preview {
  max-height: 360px;
  overflow-y: auto;
}

.notification-preview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 4px;
  color: inherit;
  text-decoration: none;
}

.notification-preview-content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  color: inherit;
  text-decoration: none;
}

.notification-preview-item + .notification-preview-item {
  border-top: 1px solid var(--el-border-color-lighter);
}

.notification-preview-item:hover {
  background: var(--el-fill-color-light);
}

.notification-preview-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-preview-date {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: normal;
}
</style>
