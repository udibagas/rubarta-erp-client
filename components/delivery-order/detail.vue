<template>
  <el-divider content-position="left">Delivery Order Information</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Number">
      {{ deliveryOrder.number }}
    </el-descriptions-item>
    <el-descriptions-item label="Date">
      {{ formatDate(deliveryOrder.date) }}
    </el-descriptions-item>
    <el-descriptions-item label="Sales Order">
      {{ deliveryOrder.SalesOrder?.number || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Sender">
      {{ deliveryOrder.sender || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Recipient">
      {{ deliveryOrder.recipient || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Notes">
      {{ deliveryOrder.notes || "-" }}
    </el-descriptions-item>
  </el-descriptions>

  <el-divider content-position="left">Customer Information</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Customer">
      {{ deliveryOrder.Customer?.name || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Address">
      {{ deliveryOrder.Customer?.address || "-" }}
    </el-descriptions-item>
  </el-descriptions>

  <template v-if="deliveryOrder.supportingDocument?.length">
    <el-divider content-position="left">Supporting Document</el-divider>
    <div class="flex flex-col gap-1">
      <el-link
        v-for="(doc, i) in deliveryOrder.supportingDocument"
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
  deliveryOrder: {
    type: Object,
    required: true,
  },
});

const config = useRuntimeConfig();
</script>
