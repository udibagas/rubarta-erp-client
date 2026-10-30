<template>
  <el-alert
    v-if="errors"
    title="Invalid Items"
    type="error"
    show-icon
    :closable="false"
  >
    <ul v-if="Array.isArray(errors)">
      <li v-for="(error, i) in errors" :key="i">
        #{{ Number(error.property) + 1 }}:
        {{ error.children?.map((child) => child.error).filter(Boolean).join(", ") }}
      </li>
    </ul>

    <div v-else>
      {{ errors }}
    </div>
  </el-alert>
</template>

<script setup>
defineProps({
  errors: {
    type: [Array, String],
    default: null,
  },
});
</script>
