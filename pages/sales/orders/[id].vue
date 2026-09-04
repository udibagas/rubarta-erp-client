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
                    @click="editorder"
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
                    @click="openSendDialog"
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

    <el-dialog
      v-model="sendDialogVisible"
      title="Send order"
      width="700px"
      @closed="resetSendForm"
    >
      <el-form :model="sendForm" label-position="left" label-width="100px">
        <el-form-item label="Subject">
          <el-input v-model="sendForm.subject" placeholder="order subject" />
        </el-form-item>

        <el-form-item label="To">
          <el-input v-model="sendForm.to" />
        </el-form-item>

        <el-form-item label="CC">
          <el-input v-model="sendForm.cc" placeholder="CC recipients" />
        </el-form-item>

        <el-form-item label="Attachment">
          <el-tag
            effect="plain"
            class="cursor-pointer"
            type="success"
            size="large"
            @click="() => previeworder()"
          >
            <span class="flex items-center gap-1">
              <el-icon>
                <ElIconDocument />
              </el-icon>
              {{ order?.number }}.pdf
            </span>
          </el-tag>
        </el-form-item>

        <el-input
          v-model="sendForm.body"
          type="textarea"
          :rows="10"
          placeholder="Write your email message here"
        />
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="sendDialogVisible = false" plain type="info">
            Cancel
          </el-button>
          <el-button
            type="success"
            :loading="isSendingEmail"
            @click="submitSendorder"
          >
            {{ isSendingEmail ? "Sending..." : "Send Email" }}
          </el-button>
        </span>
      </template>
    </el-dialog>

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
const sendDialogVisible = ref(false);
const isSendingEmail = ref(false);

const sendForm = reactive({
  subject: "",
  body: "",
  to: "",
  cc: "",
});

const soId = route.params.id;

const { data: order, refetch } = useQuery({
  queryKey: ["order", soId],
  queryFn: () => request(`/api/orders/${soId}`),
});

function editOrder() {
  // Transform OrderItems to items format for the form
  const formData = {
    ...order.value,
    items: order.value.OrderItems || [],
  };
  orderFormRef.value?.openForm(formData);
}

function resetSendForm() {
  sendForm.subject = "";
  sendForm.body = "";
  sendForm.to = "";
  sendForm.cc = "";
}

function openSendDialog() {
  if (!order.value) return;

  const customerName = order.value.Customer?.name || "Customer";
  const subject = `order ${order.value.number}${
    order.value.title ? ` - ${order.value.title}` : ""
  }`;

  sendForm.subject = subject;
  sendForm.to = order.value.contactEmail || "";
  sendForm.body = `Dear ${customerName},\n\nPlease find attached our order for your review.\n\nIf you have any questions or need adjustments, please let us know.\n\nBest regards,\n${order.value.User?.name || "Sales Team"}`;
  sendDialogVisible.value = true;
}

async function submitSendorder() {
  if (!order.value) return;

  const trimmedSubject = sendForm.subject.trim();
  const trimmedBody = sendForm.body.trim();

  if (!trimmedSubject || !trimmedBody) {
    ElMessage.warning("Please fill in the email subject and body.");
    return;
  }

  const ccRecipients = sendForm.cc
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  try {
    isSendingEmail.value = true;

    await request(`/api/orders/${soId}/send`, {
      method: "POST",
      body: {
        subject: trimmedSubject,
        to: order.value.contactEmail,
        body: trimmedBody,
        cc: ccRecipients,
      },
    });

    ElMessage.success("order email sent successfully");
    sendDialogVisible.value = false;
    resetSendForm();
  } catch (error) {
    console.error("Send order error:", error);
    ElMessage.error("Failed to send order email");
  } finally {
    isSendingEmail.value = false;
  }
}

async function updateSalesOrderStatus(status, successMessage) {
  try {
    await request(`/api/orders/${soId}`, {
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
      await request(`/api/orders/${soId}/submit`, {
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
  const pdfUrl = `${config.public.apiBase}/api/orders/${soId}/preview`;
  window.open(pdfUrl, "_blank");
}
</script>
