<template>
  <el-tag :type="colors[status]" :effect="effect" round>
    <div class="flex items-center gap-1">
      <slot name="icon" />
      <span>{{ status.replace("_", " ") }}</span>
    </div>
  </el-tag>
</template>

<script setup>
import { colors } from "~/constants/colors";
const { status, effect = "dark" } = defineProps(["status", "effect", "size"]);
</script>
