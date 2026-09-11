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

    <SendEmail
      ref="sendEmailRef"
      type="sales-order"
      :data="order"
      :on-preview="previewOrder"
      :to="order?.contactEmail ?? ''"
      :recipient-name="order?.contactPerson ?? ''"
      :cc="order?.User?.email ?? ''"
      :from-name="order?.User?.name ?? ''"
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
const sendEmailRef = ref(null);

const soId = route.params.id;

const { data: order, refetch } = useQuery({
  queryKey: ["order", soId],
  queryFn: () => request(`/api/sales-orders/${soId}`),
});

const menus = computed(() => [
  {
    label: "Edit",
    action: editOrder,
    icon: ElIconEdit,
    visible: order.value?.status === "Draft",
  },
  {
    label: "Delete",
    action: deleteOrder,
    icon: ElIconDelete,
    class: "text-error!",
    visible: order.value?.status === "Draft",
  },
  {
    label: "Mark As Confirmed",
    action: () => updateSalesOrderStatus("Confirmed"),
    icon: ElIconCircleCheck,
    class: "text-success!",
    visible: order.value?.status === "Draft",
  },
  {
    label: "Send",
    action: () => sendEmailRef.value?.openDialog(),
    icon: ElIconMessage,
    visible: order.value?.status === "Confirmed",
  },
  {
    label: "Mark As Sent",
    action: () => updateSalesOrderStatus("Sent"),
    icon: ElIconCircleCheckFilled,
    class: "text-warning!",
    visible: order.value?.status === "Confirmed",
  },
  {
    label: "Mark As Pending",
    action: () => updateSalesOrderStatus("Pending"),
    icon: ElIconCircleCheckFilled,
    class: "text-warning!",
    visible: order.value?.status === "Sent",
  },
  {
    label: "Set To Processing",
    action: () => updateSalesOrderStatus("Processing"),
    icon: ElIconCircleCheckFilled,
    class: "text-success!",
    visible: order.value?.status === "Sent",
  },
  {
    label: "Set To Completed",
    action: () => updateSalesOrderStatus("Completed"),
    icon: ElIconCircleCheckFilled,
    class: "text-success!",
    visible: order.value?.status === "Sent",
  },
  {
    label: "Set To Cancelled",
    action: () => updateSalesOrderStatus("Cancelled"),
    icon: ElIconCircleCloseFilled,
    class: "text-error!",
    visible: order.value?.status === "Confirmed",
  },
  {
    label: "Print PDF",
    action: previewOrder,
    icon: ElIconPrinter,
    visible: true,
  },
]);

function editOrder() {
  const formData = {
    ...order.value,
    items: order.value.SalesOrderItems || [],
  };

  orderFormRef.value?.openForm(formData);
}

function deleteOrder() {
  ElMessageBox.confirm(
    "Are you sure you want to delete this sales order?",
    "Confirm",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await request(`/api/sales-orders/${soId}`, {
          method: "DELETE",
        });

        ElMessage({
          type: "success",
          message: "Sales order deleted successfully",
        });

        // Redirect to the sales orders list page after deletion
        navigateTo("/sales/orders");
      } catch (error) {
        console.error("Delete sales order error:", error);
        ElMessage.error("Failed to delete sales order");
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Sales order deletion canceled",
      });
    });
}

async function updateSalesOrderStatus(status) {
  const successMessages = {
    Sent: "Sales order marked as sent",
    Processing: "Sales order marked as processing",
    Completed: "Sales order marked as completed",
    Cancelled: "Sales order marked as cancelled",
    Pending: "Sales order marked as pending",
  };

  const successMessage =
    successMessages[status] || "Sales order status updated";

  ElMessageBox.confirm(
    `Mark this sales order as ${status.toLowerCase()}?`,
    "Confirm",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "success",
    },
  )
    .then(async () => {
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
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: `Sales order ${status.toLowerCase()} canceled`,
      });
    });
}

function previewOrder() {
  const pdfUrl = `${config.public.apiBase}/api/sales-orders/${soId}/preview`;
  window.open(pdfUrl, "_blank");
}
</script>
