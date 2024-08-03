<template>
  <el-tag :type="colors[status]" effect="dark">
    {{ status.replace("_", " ") }}
  </el-tag>
</template>

<script setup>
import { colors } from "~/constants/colors";
const { status } = defineProps(["status"]);
</script>
