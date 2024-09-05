<template>
  <el-container>
    <el-aside width="auto">
      <div v-show="!collapse" class="brand-box">
        <img
          src="/images/logo.png"
          style="height: 60px; width: 60px; margin: 25px 0 10px 0"
        />

        <div style="padding: 20px">
          <strong>{{ user.name }}</strong>
          <br />
          <small>{{ user.email }}</small>
        </div>
      </div>

      <Menu :collapse="collapse" />
    </el-aside>
    <el-container>
      <el-header>
        <Navbar :collapse="collapse" @toggle="collapse = !collapse" />
      </el-header>

      <el-main style="height: calc(100vh - 60px); overflow: auto">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
const { user } = useSanctumAuth();
const collapse = ref(false);
</script>
