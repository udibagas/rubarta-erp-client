<template>
  <div class="navbar">
    <el-icon :size="24" @click.prevent="emit('toggle')" style="cursor: pointer">
      <ElIconExpand v-if="collapse" />
      <ElIconFold v-else />
    </el-icon>

    <div class="brand" style="flex-grow: 1">RUBARTA ERP SYSTEM</div>

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

    <el-badge :value="unread == 0 ? undefined : unread" :max="10">
      <NuxtLink to="/notifications">
        <el-icon :size="24">
          <ElIconBell />
        </el-icon>
      </NuxtLink>
    </el-badge>

    <el-dropdown>
      <el-avatar :size="30"> {{ user.name[0] }} </el-avatar>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            :icon="ElIconUser"
            @click.native.prevent="showProfile = true"
            >My Profile</el-dropdown-item
          >
          <el-dropdown-item
            :icon="ElIconArrowRight"
            @click.native.prevent="handleClickLogout"
            >Sign Out</el-dropdown-item
          >
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>

  <Profile :show="showProfile" @close="showProfile = false" />
</template>

<script setup>
const { collapse } = defineProps(["collapse"]);
const emit = defineEmits(["toggle"]);
const companyId = ref(useCookie("companyId"));
const request = useRequest();
const { user, logout } = useSanctumAuth();
const showProfile = ref(false);

const { data: companies } = useQuery({
  queryKey: ["companies"],
  queryFn: () => request("/api/companies"),
});

const { data: unread } = useQuery({
  queryKey: ["unread-notifications"],
  queryFn: () => request("/api/notifications/unread"),
});

const { mutate: changeCompany } = useMutation({
  mutationFn: (id) => request(`/api/companies/set/${id}`, { method: "POST" }),
  queryKey: ["companyId"],
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
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  align-content: stretch;
  gap: 25px;
  height: 60px;
}
</style>
