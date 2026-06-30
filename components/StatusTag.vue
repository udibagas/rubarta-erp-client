<template>
  <el-tag :type="colors[status]" :effect="effect" :size="size" round>
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
  size = "medium",
} = defineProps(["status", "effect", "size"]);
</script>
