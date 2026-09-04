<template>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Date">
      {{ formatDate(order.date) }}
    </el-descriptions-item>
    <el-descriptions-item label="Request Type">
      {{ order.requestType }}
    </el-descriptions-item>
    <el-descriptions-item label="Customer">
      {{ order.Customer?.name }}
    </el-descriptions-item>
    <el-descriptions-item label="Address">
      {{ order.customerAddress || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Contact Person">
      {{ order.contactPerson || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Phone">
      {{ order.contactPhone || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Email">
      {{ order.contactEmail || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Currency">
      {{ order.currency }}
    </el-descriptions-item>
    <el-descriptions-item label="Payment Method">
      {{ order.paymentMethod }}
    </el-descriptions-item>
    <el-descriptions-item label="Term of Payment">
      {{ order.termOfPayment }}
    </el-descriptions-item>
    <el-descriptions-item label="Term of Delivery">
      {{ order.termOfDelivery }}
    </el-descriptions-item>
    <el-descriptions-item label="Description">
      {{ order.description }}
    </el-descriptions-item>
    <el-descriptions-item label="Terms & Conditions">
      {{ order.termsAndConditions }}
    </el-descriptions-item>
    <el-descriptions-item label="Notes">
      {{ order.notes }}
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
defineProps({
  order: {
    type: Object,
    required: true,
  },
});
</script>
