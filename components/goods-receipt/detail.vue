<template>
  <el-divider content-position="left">Goods Receipt Information</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Number">
      {{ goodsReceipt.number }}
    </el-descriptions-item>
    <el-descriptions-item label="Date">
      {{ formatDate(goodsReceipt.date) }}
    </el-descriptions-item>
    <el-descriptions-item label="Purchase Order">
      {{ goodsReceipt.PurchaseOrder?.number || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Sender">
      {{ goodsReceipt.sender || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Recipient">
      {{ goodsReceipt.recipient || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Notes">
      {{ goodsReceipt.notes || "-" }}
    </el-descriptions-item>
  </el-descriptions>

  <el-divider content-position="left">Supplier Information</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Supplier">
      {{ goodsReceipt.Supplier?.name || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Address">
      {{ goodsReceipt.Supplier?.address || "-" }}
    </el-descriptions-item>
  </el-descriptions>

  <template v-if="goodsReceipt.supportingDocument?.length">
    <el-divider content-position="left">Supporting Document</el-divider>
    <div class="flex flex-col gap-1">
      <el-link
        v-for="(doc, i) in goodsReceipt.supportingDocument"
        :key="i"
        type="primary"
        :href="`${config.public.apiBase}/${doc.filePath}`"
        target="_blank"
      >
        {{ doc.fileName }}
      </el-link>
    </div>
  </template>
</template>

<script setup>
defineProps({
  goodsReceipt: {
    type: Object,
    required: true,
  },
});

const config = useRuntimeConfig();
</script>
