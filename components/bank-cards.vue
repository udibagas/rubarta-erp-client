<template>
  <div class="flex gap-4">
    <div
      v-for="bank in banks"
      :key="bank.accountNumber"
      class="rounded border border-gray-200 bg-gray-50 px-3 py-2 w-full hover:border-green-500 hover:bg-green-50 cursor-pointer"
      @click="() => setBank(bank)"
      :class="{
        'border-green-500 bg-green-50':
          form.bank?.accountNumber === bank.accountNumber,
      }"
    >
      <div class="flex justify-between gap-2">
        <div class="font-semibold line-clamp-1">
          {{ bank.accountName }}
        </div>
        <el-tag v-if="bank.isPrimary" type="success" plain size="small">
          Primary
        </el-tag>
      </div>
      <div class="font-mono text-sm tabular-nums text-gray-600">
        Acc No. {{ bank.accountNumber }}
      </div>
      <div class="text-xs font-medium uppercase tracking-wide text-gray-400">
        {{ bank.name }} - {{ bank.branch }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  banks: {
    type: Array,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:bank"]);

function setBank(bank) {
  emit("update:bank", bank);
}
</script>
