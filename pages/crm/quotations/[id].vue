<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack">
        <template #content>
          <span class="font-medium mr-2"> #{{ quotation?.number }} </span>
          <span class="text-sm text-gray-500">{{ quotation?.title }}</span>
        </template>
        <template #extra>
          <div class="flex gap-2 items-center">
            <StatusTag
              :status="quotation?.status || 'Draft'"
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
                    @click="editQuotation"
                    v-if="quotation?.status === 'Draft'"
                  >
                    Edit
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconCircleCheckFilled"
                    v-if="quotation?.status === 'Draft'"
                    @click="handleSubmitButton"
                  >
                    Submit
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconMessage"
                    v-if="quotation?.status === 'Approved'"
                    @click="openSendDialog"
                  >
                    Send
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconCircleCheckFilled"
                    v-if="quotation?.status === 'Sent'"
                    @click="handleSetToAccepted"
                    class="text-green-500!"
                  >
                    Set To Accepted
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconCircleCloseFilled"
                    v-if="quotation?.status === 'Sent'"
                    @click="handleSetToRejected"
                    class="text-red-500!"
                  >
                    Set To Rejected
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconPrinter"
                    @click="() => previewQuotation()"
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

    <div v-if="quotation">
      <div class="flex gap-2">
        <div class="grow overflow-auto">
          <el-tabs type="card">
            <el-tab-pane label="QUOTATION INFORMATION">
              <QuotationDetail :quotation="quotation" />
            </el-tab-pane>
            <el-tab-pane label="QUOTATION ITEMS">
              <QuotationItems :quotation="quotation" />
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="w-85 shrink-0 flex flex-col gap-2">
          <ApprovalList
            v-if="quotation.status !== 'Draft'"
            approvalType="QUOTATION"
            :moduleId="quotationId"
            @update="() => refetch()"
          />
          <QuotationSummary :quotation="quotation" :totals="totals" />
        </div>
      </div>
    </div>

    <el-dialog
      v-model="sendDialogVisible"
      title="Send quotation"
      width="700px"
      @closed="resetSendForm"
    >
      <el-form :model="sendForm" label-position="left" label-width="100px">
        <el-form-item label="Subject">
          <el-input
            v-model="sendForm.subject"
            placeholder="Quotation subject"
          />
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
            @click="() => previewQuotation()"
          >
            <span class="flex items-center gap-1">
              <el-icon>
                <ElIconDocument />
              </el-icon>
              {{ quotation?.number }}.pdf
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
            @click="submitSendQuotation"
          >
            {{ isSendingEmail ? "Sending..." : "Send Email" }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <QuotationForm ref="quotationFormRef" @saved="() => refetch()" />
  </nuxt-layout>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";

definePageMeta({ layout: false });

const route = useRoute();
const config = useRuntimeConfig();
const request = useRequest();
const quotationFormRef = ref(null);
const sendDialogVisible = ref(false);
const isSendingEmail = ref(false);

const sendForm = reactive({
  subject: "",
  body: "",
  to: "",
  cc: "",
});

const quotationId = route.params.id;

const {
  isPending,
  data: quotation,
  refetch,
} = useQuery({
  queryKey: ["quotation", quotationId],
  queryFn: () => request(`/api/quotations/${quotationId}`),
});

const totals = computed(() => {
  if (!quotation.value || !quotation.value.QuotationItems) {
    return { subtotal: 0, vat: 0, grandTotal: 0 };
  }

  let subtotal = 0;
  let vatTotal = 0;

  quotation.value.QuotationItems.forEach((item) => {
    const baseAmount = item.quantity * item.unitPrice;
    const discountAmount = baseAmount * ((item.discount || 0) / 100);
    const amountAfterDiscount = baseAmount - discountAmount;

    subtotal += amountAfterDiscount;

    if (item.vat) {
      vatTotal += amountAfterDiscount * 0.11;
    }
  });

  // Apply quotation-level discount
  const quotationDiscount = quotation.value.discount || 0;
  subtotal -= quotationDiscount;

  return {
    subtotal,
    vat: vatTotal,
    grandTotal: subtotal + vatTotal,
  };
});

function editQuotation() {
  // Transform QuotationItems to items format for the form
  const formData = {
    ...quotation.value,
    items: quotation.value.QuotationItems || [],
  };
  quotationFormRef.value?.openForm(formData);
}

function resetSendForm() {
  sendForm.subject = "";
  sendForm.body = "";
  sendForm.to = "";
  sendForm.cc = "";
}

function openSendDialog() {
  if (!quotation.value) return;

  const customerName = quotation.value.Customer?.name || "Customer";
  const subject = `Quotation ${quotation.value.number}${
    quotation.value.title ? ` - ${quotation.value.title}` : ""
  }`;

  sendForm.subject = subject;
  sendForm.to = quotation.value.contactEmail || "";
  sendForm.body = `Dear ${customerName},\n\nPlease find attached our quotation for your review.\n\nIf you have any questions or need adjustments, please let us know.\n\nBest regards,\n${quotation.value.User?.name || "Sales Team"}`;
  sendDialogVisible.value = true;
}

async function submitSendQuotation() {
  if (!quotation.value) return;

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

    await request(`/api/quotations/${quotationId}/send`, {
      method: "POST",
      body: {
        subject: trimmedSubject,
        to: quotation.value.contactEmail,
        body: trimmedBody,
        cc: ccRecipients,
      },
    });

    ElMessage.success("Quotation email sent successfully");
    sendDialogVisible.value = false;
    resetSendForm();
  } catch (error) {
    console.error("Send quotation error:", error);
    ElMessage.error("Failed to send quotation email");
  } finally {
    isSendingEmail.value = false;
  }
}

async function updateQuotationStatus(status, successMessage) {
  try {
    await request(`/api/quotations/${quotationId}`, {
      method: "PATCH",
      body: { status },
    });

    ElMessage.success(successMessage);
    refetch();
  } catch (error) {
    console.error("Update quotation status error:", error);
    ElMessage.error("Failed to update quotation status");
  }
}

function handleSetToAccepted() {
  ElMessageBox.confirm("Mark this quotation as accepted?", "Confirm", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "success",
  })
    .then(() => {
      updateQuotationStatus("Accepted", "Quotation marked as accepted");
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Quotation acceptance canceled",
      });
    });
}

function handleSetToRejected() {
  ElMessageBox.confirm("Mark this quotation as rejected?", "Confirm", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(() => {
      updateQuotationStatus("Rejected", "Quotation marked as rejected");
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Quotation rejection canceled",
      });
    });
}

async function handleSubmitButton() {
  ElMessageBox.confirm(
    "Are you sure you want to submit this quotation?",
    "Warning",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning",
    },
  )
    .then(async () => {
      await request(`/api/quotations/${quotationId}/submit`, {
        method: "POST",
      });

      ElMessage({
        type: "success",
        message: "Quotation submitted successfully",
      });

      refetch();
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Quotation submission canceled",
      });
    });
}

function previewQuotation() {
  const pdfUrl = `${config.public.apiBase}/api/quotations/${quotationId}/preview`;
  window.open(pdfUrl, "_blank");
}
</script>
