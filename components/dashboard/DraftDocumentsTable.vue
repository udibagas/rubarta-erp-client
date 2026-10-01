<template>
  <el-card shadow="never" body-class="p-2!">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-gray-900">Draft documents</h2>
          <p class="text-sm text-gray-500">Documents not yet finalized</p>
        </div>

        <div class="flex items-center gap-2">
          <el-tag type="info" effect="plain">
            {{ draftDocuments.length }} drafts
          </el-tag>
          <el-button size="small" :icon="ElIconRefresh" @click="refetch">
            Refresh
          </el-button>
        </div>
      </div>
    </template>

    <el-table :data="draftDocuments" v-loading="isPending" stripe>
      <template #empty>
        <el-result
          icon="success"
          title="All caught up"
          sub-title="You have no draft documents"
        />
      </template>
      <el-table-column prop="documentType" label="Type" width="150">
        <template #default="{ row }">
          <el-tag effect="plain" type="warning">
            {{ row.documentType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="number" label="Number" width="140">
        <template #default="{ row }">
          <nuxt-link
            class="line-clamp-1 font-semibold font-mono hover:underline cursor-pointer"
            :to="row.link"
          >
            {{ row.number }}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column prop="party" label="Party" min-width="150">
        <template #default="{ row }">
          <div class="line-clamp-1">{{ row.party }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="pic" label="PIC" width="140">
        <template #default="{ row }">
          <div class="line-clamp-1">{{ row.pic }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="Date" width="115" />
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
  data: draftDocumentResponse,
  isPending,
  refetch,
} = useQuery({
  queryKey: ["dashboard-draft-documents"],
  queryFn: () => request("/api/tasks/draft-documents"),
});

const draftDocuments = computed(() =>
  rowsFrom(draftDocumentResponse.value).map((doc) => ({
    documentType: doc.documentType || "-",
    date: formatDate(doc.date),
    number: doc.number || "-",
    title: doc.title || "-",
    party: doc.party || "-",
    pic: doc.pic || "-",
    link: getDraftLink(doc),
  })),
);

function getDraftLink(document) {
  const { documentType, id, number } = document;

  switch (documentType) {
    case "NKP":
      return `/nkp?number=${number}`;
    case "Quotation":
      return `/sales/quotations/${id}`;
    case "Sales Order":
      return `/sales/orders/${id}`;
    case "Invoice":
      return `/sales/invoices/${id}`;
    case "Purchase Order":
      return `/purchasing-logistics/purchase-orders/${id}`;
    case "Delivery Order":
      return `/purchasing-logistics/delivery-orders/${id}`;
    case "Goods Receipt":
      return `/purchasing-logistics/goods-receipts/${id}`;
    default:
      return "/";
  }
}
</script>
