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
          alt
        />

        <div>
          <strong>{{ user.name }}</strong>
          <br />
          <small>{{ user.email }}</small>
        </div>
      </div>
      <el-menu
        router
        :collapse="collapse"
        :default-active="$route.path"
        background-color="#060446"
        text-color="#fff"
        class="sidebar"
        active-text-color="#cc0000"
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

          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link text-white" style="cursor: pointer">
              Welcome, {{ user.name }}!
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="User" command="profile">
                  My Profile
                </el-dropdown-item>
                <el-dropdown-item :icon="ArrowRight" command="logout">
                  Sign Out
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
  Setting,
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
};

const links = [
  {
    label: "Dashboard",
    path: "/",
    icon: "HomeFilled",
  },
  {
    label: "Payment Authorization",
    path: "/payment-authorizations",
    icon: "Operation",
  },
  {
    label: "Expense Claims",
    path: "/expense-claims",
    icon: "Operation",
  },
  {
    label: "Expense Notes",
    path: "/expense-notes",
    icon: "Operation",
  },
  {
    label: "Master Data",
    path: "/master-data/companies",
    icon: "Operation",
  },
];

const store = useWebsiteStore();
const collapse = ref(false);
const showProfile = ref(false);
const navigationList = useHead({
  title: "RUBARTA ERP SYSTEM",
});

const goBack = () => {
  window.history.back();
};

const handleCommand = (command) => {
  if (command === "logout") {
    ElMessageBox.confirm("Anda yakin ingin keluar?", "Konfirmasi", {
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      type: "warning",
    })
      .then(() => logout())
      .catch(() => console.log("Action cancelled"));
  }

  if (command === "profile") {
    showProfile.value = true;
  }
};
</script>
