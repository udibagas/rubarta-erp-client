<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack">
        <template #content>
          {{ quotation?.number }}
          <div class="text-sm text-gray-500">{{ quotation?.title }}</div>
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
                    v-if="quotation?.status === 'Submitted'"
                    @click="openSendDialog"
                  >
                    Send
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconCircleCheckFilled"
                    v-if="quotation?.status === 'Sent'"
                    @click="handleSetToAccepted"
                  >
                    Set To Accepted
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconCircleCloseFilled"
                    v-if="quotation?.status === 'Sent'"
                    @click="handleSetToRejected"
                  >
                    Set To Rejected
                  </el-dropdown-item>

                  <el-dropdown-item :icon="ElIconPrinter" @click="printToPDF">
                    Print PDF
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button :icon="ElIconRefresh" @click="refreshData"> </el-button>
          </div>
        </template>
      </el-page-header>
    </template>

    <div v-if="quotation">
      <div class="flex gap-2">
        <div class="grow overflow-auto">
          <el-card shadow="never" body-style="padding: 0">
            <template #header>
              <span class="font-semibold">QUOTATION INFORMATION</span>
            </template>
            <el-descriptions :column="1" border label-width="200">
              <el-descriptions-item label="Date">
                {{ formatDate(quotation.date) }}
              </el-descriptions-item>
              <el-descriptions-item label="Valid Until">
                {{ formatDate(quotation.validUntil) }}
              </el-descriptions-item>
              <el-descriptions-item label="Validity">
                {{ quotation.validity }} days
              </el-descriptions-item>
              <el-descriptions-item label="Sales Person">
                {{ quotation.User?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="Request Type">
                {{ quotation.requestType }}
              </el-descriptions-item>
              <el-descriptions-item label="Customer">
                {{ quotation.Customer?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="Address">
                {{ quotation.customerAddress || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="Contact Person">
                {{ quotation.contactPerson || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="Phone">
                {{ quotation.contactPhone || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="Email">
                {{ quotation.contactEmail || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="Currency">
                {{ quotation.currency }}
              </el-descriptions-item>
              <el-descriptions-item label="Payment Method">
                {{ quotation.paymentMethod }}
              </el-descriptions-item>
              <el-descriptions-item label="Term of Payment">
                {{ quotation.termOfPayment }}
              </el-descriptions-item>
              <el-descriptions-item label="Term of Delivery">
                {{ quotation.termOfDelivery }}
              </el-descriptions-item>
              <el-descriptions-item label="Description">
                {{ quotation.description }}
              </el-descriptions-item>
              <el-descriptions-item label="Terms & Conditions">
                {{ quotation.termsAndConditions }}
              </el-descriptions-item>
              <el-descriptions-item label="Notes">
                {{ quotation.notes }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- Items Table -->
          <el-card shadow="never" class="mt-2" body-style="padding: 0;">
            <template #header>
              <span class="font-semibold">
                QUOTATION ITEMS ({{ quotation.QuotationItems.length }})
              </span>
            </template>
            <el-table :data="quotation.QuotationItems" stripe border>
              <el-table-column type="index" label="#" width="60" />
              <el-table-column label="PN" prop="partNumber" width="120" />
              <el-table-column label="Description" min-width="150">
                <template #default="{ row }">
                  <div class="font-medium">{{ row.name }}</div>
                  <div
                    v-if="row.model || row.description"
                    class="text-sm text-gray-500"
                  >
                    {{ row.model }}
                    {{ row.description }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Qty" width="80" align="center">
                <template #default="{ row }">
                  <span class="font-mono">{{ toDecimal(row.quantity) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Unit Price" width="120" align="right">
                <template #default="{ row }">
                  <span class="font-mono">{{ toDecimal(row.unitPrice) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Amount" width="120" align="right">
                <template #default="{ row }">
                  <span class="font-mono">{{
                    toDecimal(calculateItemAmount(row))
                  }}</span>
                </template>
              </el-table-column>
            </el-table>

            <el-descriptions :column="1" border label-width="500">
              <el-descriptions-item
                label="Subtotal"
                class-name="font-mono"
                align="right"
              >
                {{ toDecimal(totals.subtotal) }}
              </el-descriptions-item>
              <el-descriptions-item
                label="Discount"
                align="right"
                class-name="font-mono"
              >
                {{ toDecimal(quotation.discount) }}
              </el-descriptions-item>
              <el-descriptions-item
                label="VAT (11%)"
                align="right"
                class-name="font-mono"
              >
                {{ toDecimal(totals.vat) }}
              </el-descriptions-item>
              <el-descriptions-item
                label="Grand Total"
                align="right"
                class-name="font-semibold text-green-600! font-mono"
              >
                {{ toDecimal(totals.grandTotal) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </div>

        <div class="w-90 shrink-0 flex flex-col gap-2">
          <ApprovalList approvalType="QUOTATION" :moduleId="quotationId" />
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
            Send Email
          </el-button>
        </span>
      </template>
    </el-dialog>

    <QuotationForm ref="quotationFormRef" @saved="onQuotationSaved" />
  </nuxt-layout>
</template>

<script setup>
definePageMeta({
  layout: false,
});

import { useQuery, useQueryClient } from "@tanstack/vue-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const route = useRoute();
const request = useRequest();
const queryClient = useQueryClient();
const quotationFormRef = ref(null);
const isGeneratingPDF = ref(false);
const sendDialogVisible = ref(false);
const isSendingEmail = ref(false);

const sendForm = reactive({
  subject: "",
  body: "",
  to: "",
  cc: "",
});

const quotationId = route.params.id;

const { isPending, data: quotation } = useQuery({
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

function calculateItemAmount(item) {
  const baseAmount = item.quantity * item.unitPrice;
  const discountAmount = baseAmount * ((item.discount || 0) / 100);
  const amountAfterDiscount = baseAmount - discountAmount;
  const vatAmount = item.vat ? amountAfterDiscount * 0.11 : 0;
  return amountAfterDiscount + vatAmount;
}

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

async function printToPDF() {
  try {
    isGeneratingPDF.value = true;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.text("QUOTATION", pageWidth / 2, yPos, { align: "center" });

    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text(quotation.value.number, pageWidth / 2, yPos, { align: "center" });

    yPos += 15;

    // Quotation Info - Left Column
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Quotation Information", 14, yPos);

    doc.setFont(undefined, "normal");
    yPos += 7;
    doc.text(`Date: ${formatDate(quotation.value.date)}`, 14, yPos);
    yPos += 5;
    doc.text(
      `Valid Until: ${formatDate(quotation.value.validUntil)}`,
      14,
      yPos,
    );
    yPos += 5;
    doc.text(`Validity: ${quotation.value.validity} days`, 14, yPos);
    yPos += 5;
    doc.text(`Sales Person: ${quotation.value.User?.name || "-"}`, 14, yPos);
    yPos += 5;
    doc.text(`Request Type: ${quotation.value.requestType}`, 14, yPos);

    // Customer Info - Right Column
    let yPosRight = 45;
    doc.setFont(undefined, "bold");
    doc.text("Customer Information", 110, yPosRight);

    doc.setFont(undefined, "normal");
    yPosRight += 7;
    doc.text(
      `Customer: ${quotation.value.Customer?.name || "-"}`,
      110,
      yPosRight,
    );
    yPosRight += 5;
    doc.text(
      `Address: ${quotation.value.customerAddress || "-"}`,
      110,
      yPosRight,
    );
    yPosRight += 5;
    doc.text(
      `Contact: ${quotation.value.contactPerson || "-"}`,
      110,
      yPosRight,
    );
    yPosRight += 5;
    doc.text(`Phone: ${quotation.value.contactPhone || "-"}`, 110, yPosRight);
    yPosRight += 5;
    doc.text(`Email: ${quotation.value.contactEmail || "-"}`, 110, yPosRight);

    yPos = Math.max(yPos, yPosRight) + 10;

    // Payment & Delivery Terms
    doc.setFont(undefined, "bold");
    doc.text("Payment & Delivery Terms", 14, yPos);
    yPos += 7;

    doc.setFont(undefined, "normal");
    doc.text(
      `Currency: ${quotation.value.currency} | Payment: ${quotation.value.paymentMethod} | Term: ${quotation.value.termOfPayment}`,
      14,
      yPos,
    );
    yPos += 5;
    doc.text(`Delivery Term: ${quotation.value.termOfDelivery}`, 14, yPos);

    yPos += 10;

    // Title & Description
    if (quotation.value.title) {
      doc.setFont(undefined, "bold");
      doc.setFontSize(12);
      doc.text(quotation.value.title, 14, yPos);
      yPos += 7;
    }

    if (quotation.value.description) {
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);
      const splitDescription = doc.splitTextToSize(
        quotation.value.description,
        pageWidth - 28,
      );
      doc.text(splitDescription, 14, yPos);
      yPos += splitDescription.length * 5 + 5;
    }

    // Items Table
    const tableData = quotation.value.QuotationItems.map((item, index) => [
      index + 1,
      item.partNumber,
      `${item.name}`,
      toDecimal(item.quantity),
      toDecimal(item.unitPrice),
      toDecimal(calculateItemAmount(item)),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [
        ["#", "Part Number", "Description", "Qty", "Unit Price", "Amount"],
      ],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [75, 85, 99], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 30 },
        2: { cellWidth: 60 },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 30, halign: "right" },
        5: { cellWidth: 30, halign: "right" },
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Summary
    const summaryX = pageWidth - 70;
    doc.setFontSize(10);
    doc.text("Subtotal:", summaryX, yPos);
    doc.text(toDecimal(totals.value.subtotal), summaryX + 50, yPos, {
      align: "right",
    });

    yPos += 6;
    doc.text("Discount:", summaryX, yPos);
    doc.text(toDecimal(quotation.value.discount), summaryX + 50, yPos, {
      align: "right",
    });

    yPos += 6;
    doc.text("VAT (11%):", summaryX, yPos);
    doc.text(toDecimal(totals.value.vat), summaryX + 50, yPos, {
      align: "right",
    });

    yPos += 8;
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text("Grand Total:", summaryX, yPos);
    doc.text(toDecimal(totals.value.grandTotal), summaryX + 50, yPos, {
      align: "right",
    });

    // Terms & Conditions
    if (quotation.value.termsAndConditions) {
      yPos += 15;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont(undefined, "bold");
      doc.setFontSize(10);
      doc.text("Terms & Conditions", 14, yPos);
      yPos += 7;

      doc.setFont(undefined, "normal");
      doc.setFontSize(9);
      const splitTerms = doc.splitTextToSize(
        quotation.value.termsAndConditions,
        pageWidth - 28,
      );
      doc.text(splitTerms, 14, yPos);
    }

    // Open PDF in a new browser window instead of downloading it
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const pdfWindow = window.open(pdfUrl, "_blank", "noopener,noreferrer");

    if (pdfWindow) {
      pdfWindow.focus();
    } else {
      ElMessage.warning(
        "Pop-up blocked. Please allow pop-ups to open the PDF.",
      );
    }

    setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
    ElMessage.success("PDF opened successfully");
  } catch (error) {
    console.error("PDF generation error:", error);
    ElMessage.error("Failed to generate PDF");
  } finally {
    isGeneratingPDF.value = false;
  }
}

function refreshData() {
  queryClient.invalidateQueries({ queryKey: ["quotation", quotationId] });
  queryClient.invalidateQueries({ queryKey: ["quotations"] });
}

function onQuotationSaved() {
  queryClient.invalidateQueries({ queryKey: ["quotation", quotationId] });
}

async function updateQuotationStatus(status, successMessage) {
  try {
    await request(`/api/quotations/${quotationId}`, {
      method: "PATCH",
      body: { status },
    });

    ElMessage.success(successMessage);
    refreshData();
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

      refreshData();
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Quotation submission canceled",
      });
    });
}
</script>
