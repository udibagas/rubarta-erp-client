<template>
  <div class="flex items-center justify-between gap-4 w-full">
    <!-- Remove the duplicate toggle button since it's now in the layout -->
    <div class="text-green-600 font-bold text-xl">RUBARTA ERP SYSTEM</div>

    <div class="flex items-center gap-4">
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

      <Profile :show="showProfile" @close="showProfile = false" />
    </div>
  </div>
</template>

<script setup>
import { useQuery, useMutation } from "@tanstack/vue-query";
const { collapse } = defineProps(["collapse"]);
const emit = defineEmits(["toggle"]);
const companyId = ref(useCookie("companyId"));
const request = useRequest();
const { user, logout } = useAuth();
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
