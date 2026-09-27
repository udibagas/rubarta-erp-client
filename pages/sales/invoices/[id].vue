<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack">
        <template #content>
          <span class="font-medium mr-2"> #{{ invoice?.number }} </span>
          <span class="text-sm text-gray-500">
            {{ invoice?.referenceNumber }}
          </span>
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

        <InvoiceSummary :invoice="invoice" />
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
      @sent="
        () => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: ['invoices'],
          });
        }
      "
    />

    <InvoiceForm
      ref="invoiceFormRef"
      @saved="
        (res) => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: ['invoices'],
          });
        }
      "
    />

    <el-dialog
      v-model="showPaidDialog"
      title="Mark Invoice as Paid"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-position="top">
        <el-form-item label="Receipt Number" :error="receiptNumberError">
          <el-input
            v-model="receiptNumber"
            placeholder="Enter receipt number"
            :disabled="isSubmittingPaidStatus"
          />
        </el-form-item>
        <el-form-item label="Receipt Files" :error="receiptFilesError">
          <el-upload
            v-model:file-list="receiptFileList"
            :action="`${config.public.apiBase}/api/file`"
            :with-credentials="true"
            :multiple="true"
            :disabled="isSubmittingPaidStatus"
            :on-preview="handleReceiptPreview"
            :on-remove="handleReceiptRemove"
            class="w-full"
          >
            <el-button :icon="ElIconUpload" :disabled="isSubmittingPaidStatus">
              Upload receipts
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button :disabled="isSubmittingPaidStatus" @click="closePaidDialog">
          Cancel
        </el-button>
        <el-button
          type="success"
          :loading="isSubmittingPaidStatus"
          @click="submitPaidStatus"
        >
          Mark as Paid
        </el-button>
      </template>
    </el-dialog>
  </nuxt-layout>
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { Flag } from "lucide-vue-next";

definePageMeta({ layout: false });

const route = useRoute();
const config = useRuntimeConfig();
const request = useRequest();
const queryClient = useQueryClient();

const invoiceFormRef = ref(null);
const sendEmailRef = ref(null);
const showPaidDialog = ref(false);
const receiptNumber = ref("");
const receiptFileList = ref([]);
const receiptNumberError = ref("");
const receiptFilesError = ref("");
const isSubmittingPaidStatus = ref(false);

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
    label: "Mark As Confirmed",
    action: () => updateInvoiceStatus("Confirmed"),
    icon: ElIconCircleCheck,
    class: "text-success!",
    visible: invoice.value?.status === "Draft",
  },
  {
    label: "Send",
    action: () => sendEmailRef.value?.openDialog(),
    icon: ElIconMessage,
    visible: invoice.value?.status === "Confirmed",
  },
  {
    label: "Mark As Sent",
    action: () => updateInvoiceStatus("Sent"),
    icon: ElIconCircleCheckFilled,
    class: "text-warning!",
    visible: invoice.value?.status === "Confirmed",
  },
  {
    label: "Mark As Paid",
    action: () => updateInvoiceStatus("Paid"),
    icon: ElIconCircleCheckFilled,
    class: "text-success!",
    visible: invoice.value?.status === "Sent",
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
    items: [...invoice.value.InvoiceItems] || [],
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

        ElNotification.success({
          type: "success",
          message: "Invoice deleted successfully",
        });

        navigateTo("/sales/invoices");
        queryClient.invalidateQueries({
          queryKey: ["invoices"],
        });
      } catch (error) {
        console.error("Delete invoice error:", error);
        ElNotification.error({
          title: "Error",
          message: "Failed to delete invoice. " + error.message,
        });
      }
    })
    .catch(() => {
      ElNotification.info({
        title: "Info",
        message: "Invoice deletion canceled",
      });
    });
}

async function updateInvoiceStatus(status) {
  if (status === "Paid") {
    receiptNumber.value = "";
    receiptFileList.value = [];
    receiptNumberError.value = "";
    receiptFilesError.value = "";
    showPaidDialog.value = true;
    return;
  }

  const successMessages = {
    Confirmed: "Invoice marked as confirmed",
    Sent: "Invoice marked as sent",
    Paid: "Invoice marked as paid",
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
        await request(`/api/invoices/${invoiceId}/status`, {
          method: "PATCH",
          body: { status },
        });

        ElNotification.success({
          title: "Success",
          message: successMessage,
        });

        refetch();
        queryClient.invalidateQueries({
          queryKey: ["invoices"],
        });
      } catch (error) {
        ElNotification.error({
          title: "Error",
          message: "Failed to update invoice status. " + error.message,
        });
      }
    })
    .catch(() => {
      ElNotification.info({
        title: "Info",
        message: `Invoice ${status.toLowerCase()} canceled`,
      });
    });
}

async function submitPaidStatus() {
  receiptNumberError.value = receiptNumber.value.trim()
    ? ""
    : "Receipt number is required";
  const uploadedFiles = receiptFileList.value
    .filter((file) => file.status === "success" && file.response)
    .map((file) => file.response);
  const hasUploadingFiles = receiptFileList.value.some(
    (file) => file.status === "uploading",
  );
  receiptFilesError.value = hasUploadingFiles
    ? "Wait for all uploads to finish"
    : uploadedFiles.length
      ? ""
      : "Upload at least one receipt file";

  if (receiptNumberError.value || receiptFilesError.value) return;

  isSubmittingPaidStatus.value = true;
  try {
    await request(`/api/invoices/${invoiceId}/status`, {
      method: "PATCH",
      body: {
        status: "Paid",
        receiptNumber: receiptNumber.value.trim(),
        receiptFiles: uploadedFiles,
      },
    });

    showPaidDialog.value = false;
    ElNotification.success({
      title: "Success",
      message: "Invoice marked as paid",
    });
    refetch();
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  } catch (error) {
    ElNotification.error({
      title: "Error",
      message: "Failed to update invoice status. " + error.message,
    });
  } finally {
    isSubmittingPaidStatus.value = false;
  }
}

function closePaidDialog() {
  showPaidDialog.value = false;
}

function handleReceiptPreview(file) {
  const path = file.response?.filePath ?? file.filePath;
  if (path) window.open(`${config.public.apiBase}/${path}`, "_blank");
}

function handleReceiptRemove(file) {
  const path = file.response?.filePath ?? file.filePath;
  if (!path) return;

  request("/api/file", {
    method: "DELETE",
    params: { path },
  });
}

function previewInvoice() {
  const pdfUrl = `${config.public.apiBase}/api/invoices/${invoiceId}/preview`;
  window.open(pdfUrl, "_blank");
}
</script>
