<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack">
        <template #content>
          <span class="font-medium mr-2"> #{{ invoice?.number }} </span>
          <span class="text-sm text-gray-500">{{
            invoice?.referenceNumber
          }}</span>
        </template>
        <template #extra>
          <div class="flex gap-2 items-center">
            <status-tag
              :status="invoice?.status || 'Draft'"
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

    <div v-if="invoice">
      <div class="flex gap-2">
        <div class="grow overflow-auto">
          <el-tabs type="card">
            <el-tab-pane label="INVOICE INFORMATION">
              <InvoiceDetail :invoice="invoice" />
            </el-tab-pane>
            <el-tab-pane label="INVOICE ITEMS">
              <InvoiceItems :invoice="invoice" />
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="w-85 shrink-0 flex flex-col gap-2">
          <ApprovalList
            v-if="invoice.status !== 'Draft'"
            approvalType="INVOICE"
            :moduleId="invoiceId"
            @update="() => refetch()"
          />
          <InvoiceSummary :invoice="invoice" />
        </div>
      </div>
    </div>

    <SendEmail
      ref="sendEmailRef"
      type="invoice"
      :data="invoice"
      :on-preview="previewInvoice"
      :to="invoice?.contactEmail ?? ''"
      :recipient-name="invoice?.contactPerson ?? ''"
      :cc="invoice?.User?.email ?? ''"
      :from-name="invoice?.User?.name ?? ''"
      @sent="() => refetch()"
    />

    <InvoiceForm ref="invoiceFormRef" @saved="() => refetch()" />
  </nuxt-layout>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";
import { Flag } from "lucide-vue-next";

definePageMeta({ layout: false });

const route = useRoute();
const config = useRuntimeConfig();
const request = useRequest();
const invoiceFormRef = ref(null);
const sendEmailRef = ref(null);

const invoiceId = route.params.id;

const { data: invoice, refetch } = useQuery({
  queryKey: ["invoice", invoiceId],
  queryFn: () => request(`/api/invoices/${invoiceId}`),
});

const menus = computed(() => [
  {
    label: "Edit",
    action: editInvoice,
    icon: ElIconEdit,
    visible: invoice.value?.status === "Draft",
  },
  {
    label: "Delete",
    action: deleteInvoice,
    icon: ElIconDelete,
    class: "text-error!",
    visible: invoice.value?.status === "Draft",
  },
  {
    label: "Submit",
    action: handleSubmitButton,
    icon: ElIconCircleCheck,
    class: "text-success!",
    visible: invoice.value?.status === "Draft",
  },
  {
    label: "Send",
    action: () => sendEmailRef.value?.openDialog(),
    icon: ElIconMessage,
    visible: invoice.value?.status === "Approved",
  },
  {
    label: "Mark As Sent",
    action: () => updateInvoiceStatus("Sent"),
    icon: ElIconCircleCheckFilled,
    class: "text-warning!",
    visible: invoice.value?.status === "Approved",
  },
  {
    label: "Set To Pending",
    action: () => updateInvoiceStatus("Pending"),
    icon: ElIconCircleCheckFilled,
    class: "text-warning!",
    visible: invoice.value?.status === "Sent",
  },
  {
    label: "Set To Paid",
    action: () => updateInvoiceStatus("Paid"),
    icon: ElIconCircleCheckFilled,
    class: "text-success!",
    visible: invoice.value?.status === "Pending",
  },
  {
    label: "Set To Overdue",
    action: () => updateInvoiceStatus("Overdue"),
    icon: ElIconCircleCloseFilled,
    class: "text-error!",
    visible: invoice.value?.status === "Pending",
  },
  {
    label: "Print PDF",
    action: previewInvoice,
    icon: ElIconPrinter,
    visible: true,
  },
]);

function editInvoice() {
  const formData = {
    ...invoice.value,
    items: invoice.value.InvoiceItems || [],
  };
  invoiceFormRef.value?.openForm(formData);
}

function deleteInvoice() {
  ElMessageBox.confirm(
    "Are you sure you want to delete this invoice?",
    "Confirm",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await request(`/api/invoices/${invoiceId}`, {
          method: "DELETE",
        });

        ElMessage({
          type: "success",
          message: "Invoice deleted successfully",
        });

        // Redirect to the invoices list page after deletion
        navigateTo("/sales/invoices");
      } catch (error) {
        console.error("Delete invoice error:", error);
        ElMessage.error("Failed to delete invoice");
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Invoice deletion canceled",
      });
    });
}

async function updateInvoiceStatus(status) {
  const successMessages = {
    Sent: "Invoice marked as sent",
    Pending: "Invoice marked as pending",
    Paid: "Invoice marked as paid",
    Overdue: "Invoice marked as overdue",
  };

  const successMessage = successMessages[status] || "Invoice status updated";

  ElMessageBox.confirm(
    `Mark this invoice as ${status.toLowerCase()}?`,
    "Confirm",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "success",
    },
  )
    .then(async () => {
      try {
        await request(`/api/invoices/${invoiceId}`, {
          method: "PATCH",
          body: { status },
        });

        ElMessage.success(successMessage);
        refetch();
      } catch (error) {
        console.error("Update invoice status error:", error);
        ElMessage.error("Failed to update invoice status");
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: `Invoice ${status.toLowerCase()} canceled`,
      });
    });
}

function handleSubmitButton() {
  ElMessageBox.confirm("Submit this invoice for approval?", "Confirm", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "success",
  })
    .then(async () => {
      try {
        await request(`/api/invoices/${invoiceId}`, {
          method: "PATCH",
          body: { status: "Submitted" },
        });

        ElMessage.success("Invoice submitted for approval");
        refetch();
      } catch (error) {
        console.error("Submit invoice error:", error);
        ElMessage.error("Failed to submit invoice");
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Invoice submission canceled",
      });
    });
}

function previewInvoice() {
  const pdfUrl = `${config.public.apiBase}/api/invoices/${invoiceId}/preview`;
  window.open(pdfUrl, "_blank");
}
</script>
