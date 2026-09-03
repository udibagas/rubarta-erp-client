<template>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Date">
      {{ formatDate(quotation.date) }}
    </el-descriptions-item>
    <el-descriptions-item label="Valid Until">
      {{ formatDate(quotation.validUntil) }}
    </el-descriptions-item>
    <el-descriptions-item label="Validity">
      {{ quotation.validity }} days
    </el-descriptions-item>
    <el-descriptions-item label="Sales Person">
      {{ quotation.User?.name }}
    </el-descriptions-item>
    <el-descriptions-item label="Request Type">
      {{ quotation.requestType }}
    </el-descriptions-item>
    <el-descriptions-item label="Customer">
      {{ quotation.Customer?.name }}
    </el-descriptions-item>
    <el-descriptions-item label="Address">
      {{ quotation.customerAddress || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Contact Person">
      {{ quotation.contactPerson || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Phone">
      {{ quotation.contactPhone || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Email">
      {{ quotation.contactEmail || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Currency">
      {{ quotation.currency }}
    </el-descriptions-item>
    <el-descriptions-item label="Payment Method">
      {{ quotation.paymentMethod }}
    </el-descriptions-item>
    <el-descriptions-item label="Term of Payment">
      {{ quotation.termOfPayment }}
    </el-descriptions-item>
    <el-descriptions-item label="Term of Delivery">
      {{ quotation.termOfDelivery }}
    </el-descriptions-item>
    <el-descriptions-item label="Description">
      {{ quotation.description }}
    </el-descriptions-item>
    <el-descriptions-item label="Terms & Conditions">
      {{ quotation.termsAndConditions }}
    </el-descriptions-item>
    <el-descriptions-item label="Notes">
      {{ quotation.notes }}
    </el-descriptions-item>
    <!-- <el-descriptions-item label="Attachment">
                {{ quotation.attachment || "-" }}
              </el-descriptions-item> -->
  </el-descriptions>
</template>

<script setup>
defineProps({
  quotation: {
    type: Object,
    required: true,
  },
});
</script>
