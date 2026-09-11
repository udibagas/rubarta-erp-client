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
                    :icon="ElIconDelete"
                    @click="deleteQuotation"
                    v-if="quotation?.status === 'Draft'"
                  >
                    Delete
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
                    @click="sendDialogRef?.openSendDialog()"
                  >
                    Send
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconCircleCheckFilled"
                    v-if="quotation?.status === 'Sent'"
                    @click="() => updateQuotationStatus('Accepted')"
                    class="text-green-500!"
                  >
                    Set To Accepted
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconCircleCloseFilled"
                    v-if="quotation?.status === 'Sent'"
                    @click="() => updateQuotationStatus('Rejected')"
                    class="text-red-500!"
                  >
                    Set To Rejected
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconCircleCheckFilled"
                    v-if="quotation?.status === 'Approved'"
                    @click="() => updateQuotationStatus('Sent')"
                    class="text-yellow-500!"
                  >
                    Mark As Sent
                  </el-dropdown-item>

                  <el-dropdown-item
                    :icon="ElIconShoppingTrolley"
                    v-if="quotation?.status === 'Accepted'"
                    class="text-green-500!"
                  >
                    Create Sales Order
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
          <QuotationSummary :quotation="quotation" />
        </div>
      </div>
    </div>

    <QuotationSendDialog
      ref="sendDialogRef"
      :quotation="quotation"
      :on-preview="previewQuotation"
    />
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
const sendDialogRef = ref(null);

const quotationId = route.params.id;

const { data: quotation, refetch } = useQuery({
  queryKey: ["quotation", quotationId],
  queryFn: () => request(`/api/quotations/${quotationId}`),
});

function editQuotation() {
  const formData = {
    ...quotation.value,
    items: quotation.value.QuotationItems || [],
  };
  quotationFormRef.value?.openForm(formData);
}

function deleteQuotation() {
  ElMessageBox.confirm(
    "Are you sure you want to delete this quotation?",
    "Confirm",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await request(`/api/quotations/${quotationId}`, {
          method: "DELETE",
        });

        ElMessage({
          type: "success",
          message: "Quotation deleted successfully",
        });

        // Redirect to the quotations list page after deletion
        navigateTo("/sales/quotations");
      } catch (error) {
        console.error("Delete quotation error:", error);
        ElMessage.error("Failed to delete quotation");
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Quotation deletion canceled",
      });
    });
}

async function updateQuotationStatus(status) {
  const successMessages = {
    Sent: "Quotation marked as sent",
    Accepted: "Quotation marked as accepted",
    Rejected: "Quotation marked as rejected",
  };

  const successMessage = successMessages[status] || "Quotation status updated";

  ElMessageBox.confirm(
    `Mark this quotation as ${status.toLowerCase()}?`,
    "Confirm",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "success",
    },
  )
    .then(async () => {
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
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: `Quotation ${status.toLowerCase()} canceled`,
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
