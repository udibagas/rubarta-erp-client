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
                  >
                    Submit
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconMessage"
                    v-if="quotation?.status === 'Submitted'"
                  >
                    Send
                  </el-dropdown-item>

                  <el-dropdown-item :icon="ElIconPrinter" @click="printToPDF">
                    Print PDF
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-page-header>
    </template>

    <div v-if="quotation">
      <!-- Quotation Information -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">QUOTATION INFORMATION</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
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
            </el-descriptions>
          </el-col>
          <el-col :span="12">
            <el-descriptions :column="1" border label-width="200">
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
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>

      <!-- Payment & Delivery Terms -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">PAYMENT & DELIVERY TERMS</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-descriptions
              :column="1"
              border
              title="Payment Terms"
              label-width="200"
            >
              <el-descriptions-item label="Currency">
                {{ quotation.currency }}
              </el-descriptions-item>
              <el-descriptions-item label="Payment Method">
                {{ quotation.paymentMethod }}
              </el-descriptions-item>
              <el-descriptions-item label="Term of Payment">
                {{ quotation.termOfPayment }}
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="12">
            <el-descriptions
              :column="1"
              border
              title="Delivery Terms"
              label-width="200"
            >
              <el-descriptions-item label="Term of Delivery">
                {{ quotation.termOfDelivery }}
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>

      <!-- Description -->
      <el-card v-if="quotation.description" shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">DESCRIPTION</span>
        </template>
        <p class="whitespace-pre-wrap">{{ quotation.description }}</p>
      </el-card>

      <!-- Items Table -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">
            QUOTATION ITEMS ({{ quotation.QuotationItems.length }})
          </span>
        </template>
        <el-table :data="quotation.QuotationItems" stripe border>
          <el-table-column type="index" label="#" width="60" />
          <el-table-column label="Part Number" prop="partNumber" width="150" />
          <el-table-column label="Description" min-width="250">
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
          <el-table-column label="Quantity" width="120" align="center">
            <template #default="{ row }">
              <span class="font-mono">{{ toDecimal(row.quantity) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Unit Price" width="150" align="right">
            <template #default="{ row }">
              <span class="font-mono">{{ toDecimal(row.unitPrice) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Amount" width="150" align="right">
            <template #default="{ row }">
              <span class="font-mono">{{
                toDecimal(calculateItemAmount(row))
              }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Summary -->
      <el-card shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">SUMMARY</span>
        </template>
        <el-row>
          <el-col :span="12" :offset="12">
            <el-descriptions :column="1" border label-width="200">
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
          </el-col>
        </el-row>
      </el-card>

      <!-- Terms & Conditions -->
      <el-card v-if="quotation.termsAndConditions" shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">TERMS & CONDITIONS</span>
        </template>
        <p class="whitespace-pre-wrap">{{ quotation.termsAndConditions }}</p>
      </el-card>

      <!-- Notes -->
      <el-card v-if="quotation.notes" shadow="never" class="mb-4">
        <template #header>
          <span class="font-semibold">NOTES</span>
        </template>
        <p class="whitespace-pre-wrap">{{ quotation.notes }}</p>
      </el-card>
    </div>

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
const router = useRouter();
const request = useRequest();
const queryClient = useQueryClient();
const quotationFormRef = ref(null);
const isGeneratingPDF = ref(false);

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
      `${item.name}\n${item.model} - ${item.description}`,
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
        4: { cellWidth: 30, halign: "right", font: "courier" },
        5: { cellWidth: 30, halign: "right", font: "courier" },
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

    // Save PDF
    doc.save(`Quotation-${quotation.value.number}.pdf`);
    doc.autoPrint();
    ElMessage.success("PDF generated successfully");
  } catch (error) {
    console.error("PDF generation error:", error);
    ElMessage.error("Failed to generate PDF");
  } finally {
    isGeneratingPDF.value = false;
  }
}

function onQuotationSaved() {
  queryClient.invalidateQueries({ queryKey: ["quotation", quotationId] });
}
</script>
