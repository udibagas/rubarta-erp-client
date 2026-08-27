<template>
  <el-tag :type="colors[status]" :effect="effect" :size="size" :round="round">
    <div class="flex items-center gap-1">
      <slot name="icon" />
      <span>{{ status.replace("_", " ") }}</span>
    </div>
  </el-tag>
</template>

<script setup>
import { colors } from "~/constants/colors";
const {
  status,
  effect = "dark",
  size = "default",
  round = true,
} = defineProps(["status", "effect", "size", "round"]);
</script>
