<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="goBack">
        <template #content>
          <span class="font-medium mr-2"> #{{ submission?.number }} </span>
        </template>
        <template #extra>
          <div class="flex gap-2 items-center">
            <status-tag
              :status="submission?.status || 'Draft'"
              effect="plain"
              size="large"
              :round="true"
            />

            <el-dropdown>
              <el-button :icon="ElIconMore"></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="m in menus.filter((m) => m.visible)"
                    :key="m.label"
                    :icon="m.icon"
                    @click="m.action"
                    :class="m.class || ''"
                    :divided="m.divided || false"
                  >
                    {{ m.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button :icon="ElIconRefresh" @click="refetch()"> </el-button>
          </div>
        </template>
      </el-page-header>
    </template>

    <div v-if="submission" class="p-2">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Number">
          {{ submission.number }}
        </el-descriptions-item>
        <el-descriptions-item label="Date">
          {{ formatDate(submission.date) }}
        </el-descriptions-item>
        <el-descriptions-item label="Customer">
          {{ submission.Customer?.name || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="Amount">
          <span class="font-mono font-semibold">
            {{ toCurrency(submission.amount) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="Created By">
          {{ submission.User?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="Created At">
          {{ formatDate(submission.createdAt) }}
          {{ formatTime(submission.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="Submitted At">
          {{ timestamp(submission.submittedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="Received At">
          {{ timestamp(submission.receivedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="Paid At">
          {{ timestamp(submission.paidAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="Description" :span="2">
          {{ submission.description || "-" }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="font-semibold mt-4 mb-2">INVOICES</div>
      <el-table stripe :data="submission.invoiceSubmissionItems">
        <template #empty>
          <el-empty description="No Invoices"> </el-empty>
        </template>
        <el-table-column label="Invoice #" min-width="200">
          <template #default="{ row }">
            <el-link
              class="font-mono font-semibold!"
              type="success"
              @click="navigateTo(`/sales/invoices/${row.invoiceId}`)"
            >
              {{ row.Invoice?.number }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusTag
              v-if="row.Invoice?.status"
              :status="row.Invoice.status"
              effect="light"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="Grand Total"
          align="right"
          header-align="right"
          min-width="150"
        >
          <template #default="{ row }">
            <span v-if="row.Invoice?.grandTotal" class="font-mono">
              {{ toCurrency(row.Invoice.grandTotal, row.Invoice.currency) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <InvoiceSubmissionForm ref="formRef" @saved="refetch()" />
  </nuxt-layout>
</template>

<script setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";

definePageMeta({ layout: false });

const route = useRoute();
const request = useRequest();
const queryClient = useQueryClient();
const formRef = ref(null);

const submissionId = route.params.id;
const baseUrl = `/api/invoice-submissions/${submissionId}`;

const { data: submission, refetch } = useQuery({
  queryKey: ["invoice-submission", submissionId],
  queryFn: () => request(baseUrl),
});

const timestamp = (value) =>
  value ? `${formatDate(value)} ${formatTime(value)}` : "-";

const menus = computed(() => [
  {
    label: "Mark As Submitted",
    action: () => updateStatus("Submitted"),
    icon: ElIconCircleCheck,
    class: "text-warning!",
    visible: submission.value?.status === "Draft",
  },
  {
    label: "Mark As Received",
    action: () => updateStatus("Received"),
    icon: ElIconCircleCheck,
    class: "text-primary!",
    visible: submission.value?.status === "Submitted",
  },
  {
    label: "Mark As Paid",
    action: () => updateStatus("Paid"),
    icon: ElIconCircleCheckFilled,
    class: "text-success!",
    visible: submission.value?.status === "Received",
  },
  {
    label: "Edit",
    action: () => formRef.value?.openForm(submission.value),
    icon: ElIconEdit,
    visible: submission.value?.status === "Draft",
  },
  {
    label: "Delete",
    divided: true,
    action: deleteSubmission,
    icon: ElIconDelete,
    class: "text-error!",
    visible: submission.value?.status === "Draft",
  },
]);

function invalidateList() {
  queryClient.invalidateQueries({ queryKey: ["invoice-submissions"] });
}

async function updateStatus(status) {
  try {
    await request(`${baseUrl}/status`, { method: "PATCH", body: { status } });
    ElNotification.success({
      title: "Success",
      message: `Submission marked as ${status}`,
    });
    refetch();
    invalidateList();
  } catch (error) {
    ElNotification.error({
      title: "Error",
      message: "Failed to update status. " + error.message,
    });
  }
}

function deleteSubmission() {
  ElMessageBox.confirm(
    "Are you sure you want to delete this submission?",
    "Confirm",
    { confirmButtonText: "OK", cancelButtonText: "Cancel", type: "warning" },
  )
    .then(async () => {
      try {
        await request(baseUrl, { method: "DELETE" });
        ElNotification.success({
          title: "Success",
          message: "Invoice submission deleted successfully",
        });
        invalidateList();
        navigateTo("/sales/invoice-submissions");
      } catch (error) {
        ElNotification.error({
          title: "Error",
          message: "Failed to delete submission. " + error.message,
        });
      }
    })
    .catch(() => {});
}
</script>
