<template>
  <el-divider content-position="left">Purchase Order Information</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Number">
      {{ purchaseOrder.number }}
    </el-descriptions-item>
    <el-descriptions-item label="Title">
      {{ purchaseOrder.title }}
    </el-descriptions-item>
    <el-descriptions-item label="Order Type">
      {{ purchaseOrder.orderType || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Date">
      {{ formatDate(purchaseOrder.date) }}
    </el-descriptions-item>
    <el-descriptions-item label="Reference Number">
      {{ purchaseOrder.referenceNumber }}
    </el-descriptions-item>
    <el-descriptions-item label="Requested By">
      {{ purchaseOrder.User?.name }}
    </el-descriptions-item>
    <el-descriptions-item label="Description">
      {{ purchaseOrder.description || "-" }}
    </el-descriptions-item>
  </el-descriptions>

  <el-divider content-position="left">Supplier Information</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Supplier">
      {{ purchaseOrder.Supplier?.name || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Supplier Address">
      {{ purchaseOrder.supplierAddress || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Billing Address">
      {{ purchaseOrder.billingAddress || "-" }}
    </el-descriptions-item>
  </el-descriptions>

  <el-divider content-position="left">Financial Details</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Currency">
      {{ purchaseOrder.currency }}
    </el-descriptions-item>
    <el-descriptions-item label="Currency Rate">
      {{ purchaseOrder.currencyRate }}
    </el-descriptions-item>
    <el-descriptions-item label="Payment Method">
      {{ purchaseOrder.paymentMethod || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Term of Payment">
      {{ purchaseOrder.termOfPayment || "-" }}
    </el-descriptions-item>
  </el-descriptions>

  <el-divider content-position="left">Shipping Information</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Delivery Method">
      {{ purchaseOrder.deliveryMethod || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Destination">
      {{ purchaseOrder.destination || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Warehouse">
      {{ purchaseOrder.warehouse || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Packing Condition">
      {{ purchaseOrder.packingCondition || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Shipping Address">
      {{ purchaseOrder.shippingAddress || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Delivery Date">
      {{
        purchaseOrder.deliveryDate
          ? formatDate(purchaseOrder.deliveryDate)
          : "-"
      }}
    </el-descriptions-item>
    <el-descriptions-item label="Term of Delivery">
      {{ purchaseOrder.termOfDelivery || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Partial Shipment">
      {{ purchaseOrder.partialShipment ? "Yes" : "No" }}
    </el-descriptions-item>
  </el-descriptions>

  <el-divider content-position="left">Terms & Conditions</el-divider>
  <el-descriptions :column="1" border label-width="200">
    <el-descriptions-item label="Terms & Conditions">
      {{ purchaseOrder.termsAndConditions || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="Notes">
      {{ purchaseOrder.notes || "-" }}
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
defineProps({
  purchaseOrder: {
    type: Object,
    required: true,
  },
});
</script>
