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
            <status-tag
              :status="order?.status || 'Draft'"
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

    <div v-if="order" class="flex gap-2">
      <div class="grow overflow-auto">
        <div class="flex gap-4 mb-4">
          <el-card class="flex-1" shadow="hover">
            <div class="flex-1 flex flex-col gap-4">
              <div class="text-gray-500 text-xl flex gap-2 items-center">
                <el-icon :size="24"> <Truck /> </el-icon>
                Delivery
              </div>

              <el-progress
                striped
                :striped-flow="deliveryProgress < 100"
                :percentage="deliveryProgress"
                color="#67C23A"
              />

              <div class="flex gap-2">
                <div class="flex-1">
                  <div class="text-gray-400 text-xs">ORDERED</div>
                  {{ totalOrdered }}
                </div>
                <div class="flex-1">
                  <div class="text-gray-400 text-xs">DELIVERED</div>
                  {{ totalDelivered }}
                </div>
                <div class="flex-1">
                  <div class="text-gray-400 text-xs">OUTSTANDING</div>
                  <span
                    :class="
                      totalOutstanding > 0 ? 'text-error' : 'text-success'
                    "
                  >
                    {{ totalOutstanding }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="flex-1" shadow="hover">
            <div class="flex-1 flex flex-col gap-4">
              <div class="text-gray-500 text-xl flex gap-2 items-center">
                <el-icon :size="24"> <Money /> </el-icon>
                Invoice
              </div>

              <el-progress
                striped
                :striped-flow="invoiceProgress < 100"
                :percentage="invoiceProgress"
                color="#67C23A"
              />

              <div class="flex gap-2">
                <div class="flex-1">
                  <div class="text-gray-400 text-xs">TOTAL</div>
                  <span class="text-sm font-semibold">
                    {{ toCurrency(order.grandTotal, order.currency) }}
                  </span>
                </div>
                <div class="flex-1">
                  <div class="text-gray-400 text-xs">PAID</div>
                  <span class="text-sm font-semibold">
                    {{ toCurrency(totalPaid, order.currency) }}
                  </span>
                </div>
                <div class="flex-1">
                  <div class="text-gray-400 text-xs">OUTSTANDING</div>
                  <span
                    :class="[
                      outstandingInvoice > 0 ? 'text-error' : 'text-success',
                      'text-sm',
                      'font-semibold',
                    ]"
                  >
                    {{ toCurrency(outstandingInvoice, order.currency) }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <el-tabs>
          <el-tab-pane label="SALES ORDER INFORMATION">
            <SalesOrderDetail :order="order" />
          </el-tab-pane>
          <el-tab-pane label="SALES ORDER ITEMS">
            <SalesOrderItems :order="order" />
          </el-tab-pane>
          <el-tab-pane label="DELIVERY ORDERS">
            <SalesOrderDeliveries :deliveries="order.DeliveryOrders" />
          </el-tab-pane>
          <el-tab-pane label="INVOICES">
            <SalesOrderInvoices :invoices="order.Invoices" />
          </el-tab-pane>
        </el-tabs>
      </div>

      <SalesOrderSummary :order="order" />
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
      @sent="() => refetch()"
    />

    <SalesOrderForm
      ref="orderFormRef"
      @saved="
        (res) => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      "
    />
  </nuxt-layout>
</template>

<script setup>
import { Money } from "@element-plus/icons-vue";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { Flag, Truck } from "lucide-vue-next";
definePageMeta({ layout: false });

const route = useRoute();
const config = useRuntimeConfig();
const request = useRequest();
const queryClient = useQueryClient();
const orderFormRef = ref(null);
const sendEmailRef = ref(null);

const soId = route.params.id;

const { data: order, refetch } = useQuery({
  queryKey: ["order", soId],
  queryFn: () => request(`/api/sales-orders/${soId}`),
});

const totalOrdered = computed(() => {
  return order.value.SalesOrderItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
});

const totalDelivered = computed(() => {
  return order.value.SalesOrderItems.reduce(
    (sum, item) => sum + item.deliveredQuantity,
    0,
  );
});

const totalOutstanding = computed(() => {
  return totalOrdered.value - totalDelivered.value;
});

const deliveryProgress = computed(() => {
  return (totalDelivered.value / totalOrdered.value) * 100;
});

const totalPaid = computed(() => {
  return order.value.Invoices.filter((i) => i.status === "Paid").reduce(
    (p, c) => p + c.grandTotal,
    0,
  );
});

const outstandingInvoice = computed(() => {
  return order.value.grandTotal - totalPaid.value;
});

const invoiceProgress = computed(() => {
  return ((totalPaid.value / order.value.grandTotal) * 100).toFixed(2);
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
    class: "text-primary!",
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
