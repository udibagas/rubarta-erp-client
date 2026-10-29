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
      <nuxt-link
        :to="`/purchasing-logistics/purchase-orders/${goodsReceipt.PurchaseOrder?.id}`"
      >
        {{ goodsReceipt.PurchaseOrder?.number || "-" }}
      </nuxt-link>
    </el-descriptions-item>
    <el-descriptions-item label="Vendor Invoice Number">
      <div class="flex items-center justify-between gap-2">
        <span v-if="!editInvoiceNumber">
          {{ goodsReceipt.vendorInvoiceNumber || "-" }}
        </span>

        <el-tooltip content="Edit" placement="top" v-if="!editInvoiceNumber">
          <el-button
            type="success"
            text
            size="small"
            :icon="ElIconEdit"
            @click="editInvoiceNumber = true"
          />
        </el-tooltip>

        <el-input
          v-if="editInvoiceNumber"
          placeholder="e.g. INV-12345"
          v-model="invoiceNumber"
        />

        <el-tooltip content="Save" placement="top" v-if="editInvoiceNumber">
          <el-button
            type="success"
            :icon="ElIconCheck"
            @click="
              updateInvoiceNumber();
              editInvoiceNumber = false;
            "
          />
        </el-tooltip>

        <el-tooltip content="Cancel" placement="top" v-if="editInvoiceNumber">
          <el-button
            plain
            :icon="ElIconClose"
            @click="editInvoiceNumber = false"
            class="ml-0!"
          />
        </el-tooltip>
      </div>
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
    <div class="flex flex-col gap-2 items-start">
      <el-link
        v-for="(doc, i) in goodsReceipt.supportingDocument"
        type="primary"
        :key="i"
        :href="`${config.public.apiBase}/${doc.filePath}`"
        target="_blank"
      >
        <span class="flex items-center gap-1">
          <el-icon><ElIconDocument /></el-icon>
          {{ doc.fileName }}
        </span>
      </el-link>
    </div>
  </template>
</template>

<script setup>
const { goodsReceipt } = defineProps({
  goodsReceipt: {
    type: Object,
    required: true,
  },
});

const config = useRuntimeConfig();
const emit = defineEmits(["refresh"]);
const editInvoiceNumber = ref(false);
const invoiceNumber = ref(goodsReceipt.vendorInvoiceNumber);
const request = useRequest();

function updateInvoiceNumber() {
  request(`/api/goods-receipts/${goodsReceipt.id}`, {
    method: "PATCH",
    body: {
      vendorInvoiceNumber: invoiceNumber.value,
    },
  })
    .then((response) => {
      ElNotification.success({
        title: "Success",
        message: "Invoice number updated successfully",
      });
      emit("refresh");
    })
    .catch((error) => {
      ElNotification.error({
        title: "Error",
        message: error.message || "Failed to update invoice number",
      });
    });
}
</script>
