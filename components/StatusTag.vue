<template>
  <el-tag :type="colors[status]" effect="dark" round>
    {{ status.replace("_", " ") }}
  </el-tag>
</template>

<script setup>
import { colors } from "~/constants/colors";
const { status, effect = "dark" } = defineProps(["status", "effect"]);
</script>
