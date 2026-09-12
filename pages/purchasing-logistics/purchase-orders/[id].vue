<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack">
        <template #content>
          <span class="font-medium mr-2"> #{{ purchaseOrder?.number }} </span>
          <span class="text-sm text-gray-500">{{ purchaseOrder?.title }}</span>
        </template>
        <template #extra>
          <div class="flex gap-2 items-center">
            <status-tag
              :status="purchaseOrder?.status || 'Draft'"
              effect="plain"
              size="large"
              :round="true"
            >
              <template #icon>
                <el-icon><Flag /></el-icon>
              </template>
            </status-tag>

            <el-dropdown>
              <el-button :icon="ElIconMore"></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="m in menus.filter((m) => m.visible)"
                    :key="m.name"
                    :icon="m.icon"
                    @click="m.action"
                    :class="m.class || ''"
                  >
                    {{ m.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button :icon="ElIconRefresh" @click="refetch"> </el-button>
          </div>
        </template>
      </el-page-header>
    </template>

    <div v-if="purchaseOrder">
      <div class="flex gap-2">
        <div class="grow overflow-auto">
          <el-tabs type="card">
            <el-tab-pane label="PURCHASE ORDER INFORMATION">
              <PurchaseOrderDetail :purchaseOrder="purchaseOrder" />
            </el-tab-pane>
            <el-tab-pane label="PURCHASE ORDER ITEMS">
              <PurchaseOrderItems :purchaseOrder="purchaseOrder" />
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="w-85 shrink-0 flex flex-col gap-2">
          <ApprovalList
            v-if="purchaseOrder.status !== 'Draft'"
            approvalType="PURCHASE_ORDER"
            :moduleId="purchaseOrderId"
            @update="() => refetch()"
          />
          <PurchaseOrderSummary :purchaseOrder="purchaseOrder" />
        </div>
      </div>
    </div>

    <SendEmail
      ref="sendEmailRef"
      type="purchaseOrder"
      :data="purchaseOrder"
      :on-preview="previewQuotation"
      :to="purchaseOrder?.Supplier?.email ?? ''"
      :recipient-name="purchaseOrder?.Supplier?.name ?? ''"
      :cc="purchaseOrder?.User?.email ?? ''"
      :from-name="purchaseOrder?.User?.name ?? ''"
      @sent="() => refetch()"
    />

    <PurchaseOrderForm ref="purchaseOrderFormRef" @saved="() => refetch()" />
  </nuxt-layout>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";
import { Flag } from "lucide-vue-next";

definePageMeta({ layout: false });

const route = useRoute();
const config = useRuntimeConfig();
const request = useRequest();
const purchaseOrderFormRef = ref(null);
const sendEmailRef = ref(null);

const purchaseOrderId = route.params.id;

const { data: purchaseOrder, refetch } = useQuery({
  queryKey: ["purchaseOrder", purchaseOrderId],
  queryFn: () => request(`/api/purchase-orders/${purchaseOrderId}`),
});

const menus = computed(() => [
  {
    label: "Edit",
    action: editPurchaseOrder,
    icon: ElIconEdit,
    visible: purchaseOrder.value?.status === "Draft",
  },
  {
    label: "Delete",
    action: deletePurchaseOrder,
    icon: ElIconDelete,
    class: "text-error!",
    visible: purchaseOrder.value?.status === "Draft",
  },
  {
    label: "Submit",
    action: handleSubmitButton,
    icon: ElIconCircleCheck,
    class: "text-success!",
    visible: purchaseOrder.value?.status === "Draft",
  },
  {
    label: "Send",
    action: () => sendEmailRef.value?.openDialog(),
    icon: ElIconMessage,
    visible: purchaseOrder.value?.status === "Confirmed",
  },
  {
    label: "Mark As Sent",
    action: () => updatePurchaseOrderStatus("Sent"),
    icon: ElIconCircleCheckFilled,
    class: "text-warning!",
    visible: purchaseOrder.value?.status === "Confirmed",
  },
  {
    label: "Set To Pending",
    action: () => updatePurchaseOrderStatus("Pending"),
    icon: ElIconCircleCheckFilled,
    class: "text-warning!",
    visible: purchaseOrder.value?.status === "Sent",
  },
  {
    label: "Set To Processing",
    action: () => updatePurchaseOrderStatus("Processing"),
    icon: ElIconCircleCheckFilled,
    class: "text-primary!",
    visible: purchaseOrder.value?.status === "Pending",
  },
  {
    label: "Set To Completed",
    action: () => updatePurchaseOrderStatus("Completed"),
    icon: ElIconCircleCheckFilled,
    class: "text-success!",
    visible: purchaseOrder.value?.status === "Processing",
  },
  {
    label: "Cancel Order",
    action: () => updatePurchaseOrderStatus("Cancelled"),
    icon: ElIconCircleCloseFilled,
    class: "text-error!",
    visible: ["Confirmed", "Sent", "Pending", "Processing"].includes(
      purchaseOrder.value?.status,
    ),
  },
  {
    label: "Print PDF",
    action: previewPurchaseOrder,
    icon: ElIconPrinter,
    visible: true,
  },
]);

function editPurchaseOrder() {
  const formData = {
    ...purchaseOrder.value,
    items: purchaseOrder.value.PurchaseOrderItems || [],
  };
  purchaseOrderFormRef.value?.openForm(formData);
}

function deletePurchaseOrder() {
  ElMessageBox.confirm(
    "Are you sure you want to delete this purchase order?",
    "Confirm",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await request(`/api/purchase-orders/${purchaseOrderId}`, {
          method: "DELETE",
        });

        ElMessage({
          type: "success",
          message: "Purchase Order deleted successfully",
        });

        // Redirect to the purchase orders list page after deletion
        navigateTo("/sales/purchase-orders");
      } catch (error) {
        console.error("Delete purchase order error:", error);
        ElMessage.error("Failed to delete purchase order");
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Purchase Order deletion canceled",
      });
    });
}

async function updatePurchaseOrderStatus(status) {
  const successMessages = {
    Sent: "Purchase order marked as sent",
    Pending: "Purchase order marked as pending",
    Processing: "Purchase order marked as processing",
    Completed: "Purchase order marked as completed",
    Cancelled: "Purchase order cancelled",
  };

  const successMessage =
    successMessages[status] || "Purchase order status updated";

  ElMessageBox.confirm(
    `Mark this purchase order as ${status.toLowerCase()}?`,
    "Confirm",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "success",
    },
  )
    .then(async () => {
      try {
        await request(`/api/purchase-orders/${purchaseOrderId}`, {
          method: "PATCH",
          body: { status },
        });

        ElMessage.success(successMessage);
        refetch();
      } catch (error) {
        console.error("Update purchase order status error:", error);
        ElMessage.error("Failed to update purchase order status");
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: `Purchase order ${status.toLowerCase()} canceled`,
      });
    });
}

async function handleSubmitButton() {
  ElMessageBox.confirm(
    "Are you sure you want to submit this purchase order?",
    "Warning",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning",
    },
  )
    .then(async () => {
      await request(`/api/purchase-orders/${purchaseOrderId}/submit`, {
        method: "POST",
      });

      ElMessage({
        type: "success",
        message: "Purchase order submitted successfully",
      });

      refetch();
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Purchase order submission canceled",
      });
    });
}

function previewPurchaseOrder() {
  const pdfUrl = `${config.public.apiBase}/api/purchase-orders/${purchaseOrderId}/preview`;
  window.open(pdfUrl, "_blank");
}
</script>
