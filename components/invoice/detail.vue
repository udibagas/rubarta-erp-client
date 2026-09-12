<template>
  <el-divider content-position="left">Invoice Information</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Number">
      {{ invoice.number }}
    </el-descriptions-item>
    <el-descriptions-item label="Reference Number">
      {{ invoice.referenceNumber || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Date">
      {{ formatDate(invoice.date) }}
    </el-descriptions-item>
    <el-descriptions-item label="Due Date">
      {{ formatDate(invoice.dueDate) }}
    </el-descriptions-item>
    <el-descriptions-item label="Sales Order">
      {{ invoice.SalesOrder?.number || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Delivery Order">
      {{ invoice.DeliveryOrder?.number || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Sales Person">
      {{ invoice.User?.name || "-" }}
    </el-descriptions-item>
  </el-descriptions>

  <el-divider content-position="left">Customer Information</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Customer">
      {{ invoice.Customer?.name || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Contact Person">
      {{ invoice.contactPerson || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Phone">
      {{ invoice.contactPhone || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Email">
      {{ invoice.contactEmail || "-" }}
    </el-descriptions-item>
  </el-descriptions>

  <el-divider content-position="left">Payment Terms</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Payment Method">
      {{ invoice.paymentMethod || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Term of Payment">
      {{ invoice.termOfPayment || "-" }}
    </el-descriptions-item>
  </el-descriptions>

  <template v-if="invoice.attachments?.length">
    <el-divider content-position="left">Attachments</el-divider>
    <div class="flex flex-col gap-1">
      <el-link
        v-for="(doc, i) in invoice.attachments"
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
  invoice: {
    type: Object,
    required: true,
  },
});

const config = useRuntimeConfig();
</script>
