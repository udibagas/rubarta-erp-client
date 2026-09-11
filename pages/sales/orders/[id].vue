<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack">
        <template #content>
          <span class="font-medium mr-2"> #{{ order?.number }} </span>
          <span class="text-sm text-gray-500">{{ order?.title }}</span>
        </template>
        <template #extra>
          <div class="flex gap-2 items-center">
            <StatusTag
              :status="order?.status || 'Draft'"
              effect="dark"
              size="large"
              :round="false"
            />

            <el-dropdown>
              <el-button :icon="ElIconMore"></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    :icon="ElIconEdit"
                    @click="editOrder"
                    v-if="order?.status === 'Draft'"
                  >
                    Edit
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconCircleCheckFilled"
                    v-if="order?.status === 'Draft'"
                    @click="handleSubmitButton"
                  >
                    Submit
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconMessage"
                    v-if="order?.status === 'Approved'"
                    @click="sendDialogRef?.openSendDialog()"
                  >
                    Send
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconCircleCheckFilled"
                    v-if="order?.status === 'Sent'"
                    @click="handleSetToAccepted"
                    class="text-green-500!"
                  >
                    Set To Accepted
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconCircleCloseFilled"
                    v-if="order?.status === 'Sent'"
                    @click="handleSetToRejected"
                    class="text-red-500!"
                  >
                    Set To Rejected
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconShoppingTrolley"
                    v-if="order?.status === 'Accepted'"
                    class="text-green-500!"
                  >
                    Create Sales Order
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconPrinter"
                    @click="() => previeworder()"
                  >
                    Print PDF
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button :icon="ElIconRefresh" @click="refetch"> </el-button>
          </div>
        </template>
      </el-page-header>
    </template>

    <div v-if="order">
      <div class="flex gap-2">
        <div class="grow overflow-auto">
          <el-tabs type="card">
            <el-tab-pane label="SALES ORDER INFORMATION">
              <SalesOrderDetail :order="order" />
            </el-tab-pane>
            <el-tab-pane label="SALES ORDER ITEMS">
              <SalesOrderItems :order="order" />
            </el-tab-pane>
          </el-tabs>
        </div>

        <SalesOrderSummary :order="order" />
      </div>
    </div>

    <SalesOrderSendDialog
      ref="sendDialogRef"
      :order="order"
      :on-preview="previeworder"
    />

    <SalesOrderForm ref="orderFormRef" @saved="() => refetch()" />
  </nuxt-layout>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";
definePageMeta({ layout: false });

const route = useRoute();
const config = useRuntimeConfig();
const request = useRequest();
const orderFormRef = ref(null);
const sendDialogRef = ref(null);

const soId = route.params.id;

const { data: order, refetch } = useQuery({
  queryKey: ["order", soId],
  queryFn: () => request(`/api/sales-orders/${soId}`),
});

function editOrder() {
  const formData = {
    ...order.value,
    items: order.value.SalesOrderItems || [],
  };

  orderFormRef.value?.openForm(formData);
}

async function updateSalesOrderStatus(status, successMessage) {
  try {
    await request(`/api/sales-orders/${soId}`, {
      method: "PATCH",
      body: { status },
    });

    ElMessage.success(successMessage);
    refetch();
  } catch (error) {
    console.error("Update sales order status error:", error);
    ElMessage.error("Failed to update sales order status");
  }
}

function handleSetToAccepted() {
  ElMessageBox.confirm("Mark this sales order as accepted?", "Confirm", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "success",
  })
    .then(() => {
      updateSalesOrderStatus("Accepted", "Sales order marked as accepted");
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Sales order acceptance canceled",
      });
    });
}

function handleSetToRejected() {
  ElMessageBox.confirm("Mark this sales order as rejected?", "Confirm", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(() => {
      updateSalesOrderStatus("Rejected", "Sales order marked as rejected");
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Sales order rejection canceled",
      });
    });
}

async function handleSubmitButton() {
  ElMessageBox.confirm(
    "Are you sure you want to submit this sales order?",
    "Warning",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning",
    },
  )
    .then(async () => {
      await request(`/api/sales-orders/${soId}/submit`, {
        method: "POST",
      });

      ElMessage({
        type: "success",
        message: "Sales order submitted successfully",
      });

      refetch();
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Sales order submission canceled",
      });
    });
}

function previeworder() {
  const pdfUrl = `${config.public.apiBase}/api/sales-orders/${soId}/preview`;
  window.open(pdfUrl, "_blank");
}
</script>
