<template>
  <div class="img-list">
    <el-image
      v-for="(url, index) in srcList"
      style="width: 100px; height: 100px"
      :src="srcList[index]"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      :preview-src-list="srcList"
      fit="contain"
      :initial-index="index"
    />
  </div>
</template>

<script setup>
const { srcList } = defineProps(["srcList"]);
</script>

<style scoped>
.img-list {
  margin: 20px 0;
  display: flex;
  gap: 5px;
}
</style>
