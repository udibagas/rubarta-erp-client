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

      <Menu :collapse="collapse" />
    </el-aside>
    <el-container>
      <el-header>
        <Navbar :collapse="collapse" @toggle="collapse = !collapse" />
      </el-header>

      <el-main style="height: calc(100vh - 60px); overflow: auto">
        <slot />
        <Profile :show="showProfile" @close="showProfile = false" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { User, ArrowRight } from "@element-plus/icons-vue";

const { user, logout } = useSanctumAuth();
const collapse = ref(false);
const showProfile = ref(false);

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
