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
            @change="(id) => changeCompany(id)"
            size="large"
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
    label: "Notifications",
    path: "/notifications",
    icon: "Bell",
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

const { user, logout } = useSanctumAuth();
const request = useRequest();
const collapse = ref(false);
const showProfile = ref(false);
const companyId = ref(useCookie("companyId"));

const goBack = () => {
  window.history.back();
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

const { data: companies } = useQuery({
  queryKey: ["companies"],
  queryFn: () => request("/api/companies"),
});

const { mutate: changeCompany } = useMutation({
  mutationFn: (id) => request(`/api/companies/set/${id}`, { method: "POST" }),
  queryKey: ["companyId"],
});
</script>
