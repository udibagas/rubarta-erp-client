<template>
  <el-container>
    <el-aside width="auto" style="padding-right: 20px">
      <div v-show="!collapse" class="brand-box">
        <img
          src="/images/logo.png"
          style="
            height: 60px;
            width: 60px;
            margin: 25px 0 10px 0;
            border-radius: 5px;
          "
        />

        <div>
          <strong>{{ user.name }}</strong>
          <br />
          <small>{{ user.email }}</small>
        </div>
      </div>

      <div v-show="!collapse" style="text-align: center; margin-bottom: 20px">
        <el-button
          :icon="User"
          type="success"
          size="small"
          @click="showProfile = true"
        >
          Profile
        </el-button>
        <el-button
          :icon="ArrowRight"
          type="danger"
          size="small"
          @click="handleClickLogout"
        >
          Sign Out
        </el-button>
      </div>

      <el-menu
        router
        :collapse="collapse"
        :default-active="$route.path"
        class="sidebar"
      >
        <el-menu-item v-for="(m, i) in links" :index="m.path" :key="i">
          <el-icon><component :is="icon[m.icon]" /></el-icon>
          <span slot="title">{{ m.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="flex align-items-center">
          <el-icon
            :size="24"
            @click.prevent="collapse = !collapse"
            style="cursor: pointer"
          >
            <Expand v-if="collapse" />
            <Fold v-else />
          </el-icon>

          <div class="brand" style="flex-grow: 1">RUBARTA ERP SYSTEM</div>

          <el-select
            v-model="companyId"
            placeholder="Select Company"
            style="width: 270px"
            @change="changeCompany"
          >
            <el-option
              v-for="c in companies"
              :key="c.id"
              :label="`${c.code} - ${c.name}`"
              :value="c.id"
            />
          </el-select>
        </div>
      </el-header>

      <el-main style="height: calc(100vh - 60px); overflow: auto">
        <slot @back="goBack" />
        <Profile :show="showProfile" @close="showProfile = false" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
const { user, logout } = useSanctumAuth();
const store = useWebsiteStore();
const api = useApi();
const collapse = ref(false);
const showProfile = ref(false);
const companyId = computed(() => store.companyId);

import {
  Fold,
  Expand,
  User,
  HomeFilled,
  Bell,
  Operation,
  DocumentCopy,
  CreditCard,
  DataAnalysis,
  ArrowRight,
  ArrowDown,
  Setting,
  Delete,
  Coin,
  Memo,
  DataLine,
  Stamp,
} from "@element-plus/icons-vue";

const icon = {
  User,
  HomeFilled,
  Bell,
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
  },
  {
    label: "Payment Authorization",
    path: "/payment-authorizations",
    icon: "Stamp",
  },
  {
    label: "Expense Claims",
    path: "/expense-claims",
    icon: "DocumentCopy",
  },
  {
    label: "Expense Notes",
    path: "/expense-notes",
    icon: "Memo",
  },
  {
    label: "Master Data",
    path: "/master-data/companies",
    icon: "Coin",
  },
];

const goBack = () => {
  window.history.back();
};

const handleCommand = (command) => {
  if (command === "logout") {
    handleClickLogout();
  }

  if (command === "profile") {
    showProfile.value = true;
  }
};

const handleClickLogout = () => {
  ElMessageBox.confirm("Anda yakin ingin keluar?", "Konfirmasi", {
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    type: "warning",
  })
    .then(() => logout())
    .catch(() => console.log("Action cancelled"));
};

const changeCompany = async (id) => {
  await api(`/api/companies/set/${id}`, { method: "POST" });
  store.setCompany(id);
};

const companies = computed(() => store.companies);

onBeforeMount(async () => {
  await store.getCompanies();
});
</script>
