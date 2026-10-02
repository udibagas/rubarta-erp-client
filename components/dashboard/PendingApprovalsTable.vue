<template>
  <el-card shadow="never" body-class="p-2!">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-gray-900">Pending approval</h2>
          <p class="text-sm text-gray-500">Documents waiting for review</p>
        </div>

        <div class="flex items-center gap-2">
          <el-tag type="warning" effect="plain">
            {{ pendingApprovals.length }} pending
          </el-tag>
          <el-button size="small" :icon="ElIconRefresh" @click="refetch">
            Refresh
          </el-button>
        </div>
      </div>
    </template>

    <el-table :data="pendingApprovals" v-loading="isPending" stripe>
      <template #empty>
        <el-result
          icon="success"
          title="All caught up"
          sub-title="You have no pending approvals"
        />
      </template>
      <el-table-column prop="document" label="Document">
        <template #default="{ row }">
          <nuxt-link
            class="line-clamp-1 font-semibold font-mono hover:underline cursor-pointer"
            :to="row.link"
          >
            {{ row.document }}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="Type" min-width="120" align="center">
        <template #default="{ row }">
          <el-tag effect="plain" type="success" size="small">
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submitted" label="Submitted" width="115" />
    </el-table>
  </el-card>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";

const request = useRequest();

const rowsFrom = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return response?.items ?? [];
};

const {
  data: approvalResponse,
  isPending,
  refetch,
} = useQuery({
  queryKey: ["dashboard-pending-approvals"],
  queryFn: () => request("/api/approvals"),
});

const pendingApprovals = computed(() =>
  rowsFrom(approvalResponse.value).map((approval) => ({
    document: approval.documentNumber || "-",
    type: approval.approvalType?.replaceAll("_", " ") || "-",
    submitted: formatDate(approval.createdAt),
    link: getApprovalLink(approval),
  })),
);

function getApprovalLink(approval) {
  const { approvalType, moduleId, documentNumber } = approval;
  switch (approvalType) {
    case "NKP":
      return `/nkp?number=${documentNumber}`;
    case "QUOTATION":
      return `/sales/quotations/${moduleId}`;
    case "SALES_ORDER":
      return `/sales/orders/${moduleId}`;
    case "INVOICE":
      return `/sales/invoices/${moduleId}`;
    default:
      return "/";
  }
}
</script>
