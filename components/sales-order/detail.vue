<template>
  <el-divider content-position="left">Sales Order Information</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Number">
      {{ order.number }}
    </el-descriptions-item>
    <el-descriptions-item label="Title">
      {{ order.title }}
    </el-descriptions-item>
    <el-descriptions-item label="Reference Number">
      {{ order.referenceNumber || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Date">
      {{ formatDate(order.date) }}
    </el-descriptions-item>
    <el-descriptions-item label="Request Type">
      {{ order.requestType }}
    </el-descriptions-item>
    <el-descriptions-item label="Description">
      {{ order.description }}
    </el-descriptions-item>
  </el-descriptions>

  <el-divider content-position="left">Customer Information</el-divider>
  <el-descriptions :column="1" border label-width="200">
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
  </el-descriptions>

  <el-divider content-position="left">Payment Terms</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Currency">
      {{ order.currency }}
    </el-descriptions-item>
    <el-descriptions-item label="Payment Method">
      {{ order.paymentMethod }}
    </el-descriptions-item>
    <el-descriptions-item label="Term of Payment">
      {{ order.termOfPayment }}
    </el-descriptions-item>
    <el-descriptions-item label="Billing Address">
      {{ order.billingAddress || "-" }}
    </el-descriptions-item>
  </el-descriptions>

  <el-divider content-position="left">Delivery Terms</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Term of Delivery">
      {{ order.termOfDelivery }}
    </el-descriptions-item>
    <el-descriptions-item label="Delivery Method">
      {{ order.deliveryMethod || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Delivery Date">
      {{ order.deliveryDate ? formatDate(order.deliveryDate) : "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Shipping Address">
      {{ order.shippingAddress || "-" }}
    </el-descriptions-item>
  </el-descriptions>

  <el-divider content-position="left">Terms & Conditions</el-divider>
  <el-descriptions :column="1" border label-width="200">
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
