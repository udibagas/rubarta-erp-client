<template>
  <el-container>
    <el-aside width="240px">
      <div v-show="!collapse" class="brand-box">
        <img src="/images/logo.png" alt="Logo" class="w-16 h-16 mx-auto my-4" />

        <div class="p-4">
          <strong>{{ user.name }}</strong>
          <br />
          <small>{{ user.email }}</small>
        </div>
      </div>

      <Menu :collapse="collapse" />
    </el-aside>
    <el-container>
      <el-header class="border-b border-y-gray-200">
        <Navbar :collapse="collapse" @toggle="collapse = !collapse" />
      </el-header>

      <el-main
        style="height: calc(100vh - 60px); overflow: auto"
        class="bg-slate-50!"
      >
        <el-card>
          <slot />
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
const { user } = useAuth();
const collapse = ref(false);
</script>
