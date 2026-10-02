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

      <el-badge :value="unread == 0 ? undefined : unread" :max="10">
        <NuxtLink to="/notifications">
          <el-icon :size="20">
            <ElIconBell />
          </el-icon>
        </NuxtLink>
      </el-badge>

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
import { useQuery, useMutation } from "@tanstack/vue-query";
import { documentTypeMeta } from "~/utils/documentType";
const emit = defineEmits(["toggle"]);
const shared = useSharedStore();
const { companyId } = storeToRefs(shared);
const request = useRequest();
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
