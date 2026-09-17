<template>
  <el-divider content-position="left">DELIVERY ORDER INFORMATION</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Sales Order Number">
      <nuxt-link
        v-if="deliveryOrder.SalesOrder?.id"
        :to="`/sales/orders/${deliveryOrder.SalesOrder.id}`"
      >
        {{ deliveryOrder.SalesOrder.number || "-" }}
      </nuxt-link>
      <span v-else>{{ deliveryOrder.SalesOrder?.number || "-" }}</span>
    </el-descriptions-item>

    <el-descriptions-item label="GR Number">
      {{ deliveryOrder.GoodsReceipt?.number || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Delivery Date">
      {{ formatDate(deliveryOrder.date) }}
    </el-descriptions-item>

    <el-descriptions-item label="Customer">
      {{ deliveryOrder.Customer?.name || deliveryOrder.customer?.name || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Supporting Document">
      <div
        v-if="deliveryOrder.supportingDocument?.length"
        class="flex flex-col gap-2 items-start"
      >
        <el-link
          v-for="(doc, i) in deliveryOrder.supportingDocument"
          :key="`${doc.filePath || i}-${i}`"
          type="primary"
          :href="`${config.public.apiBase}/${doc.filePath}`"
          target="_blank"
        >
          <span class="flex items-center gap-1">
            <el-icon><ElIconDocument /></el-icon>
            {{ doc.fileName || doc.name || "Document" }}
          </span>
        </el-link>
      </div>
      <span v-else>-</span>
    </el-descriptions-item>

    <el-descriptions-item label="Sender">
      {{ deliveryOrder.sender || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Receipt Number">
      {{ deliveryOrder.receiptNumber || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Pick Up By">
      {{ deliveryOrder.pickUpBy || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Pick Up Name">
      {{ deliveryOrder.pickUpName || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Pick Up Contact">
      {{ deliveryOrder.pickUpContact || "-" }}
    </el-descriptions-item>

    <el-descriptions-item label="Notes">
      {{ deliveryOrder.notes || "-" }}
    </el-descriptions-item>
  </el-descriptions>
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
