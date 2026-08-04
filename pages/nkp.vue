<template>
  <NuxtLayout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Nota Kuasa Pembayaran (NKP)">
        <template #extra>
          <form
            @submit.prevent="
              () => {
                page = 1;
                refreshData();
              }
            "
            class="flex items-center gap-2"
          >
            <el-button
              @click="
                openForm({
                  companyId: companyId,
                  cashAdvanceBalance: 0,
                  deduction: 0,
                  tax: 0,
                  downPayment: 0,
                  NkpItem: [
                    { date: undefined, description: undefined, amount: 0 },
                  ],
                  NkpAttachment: [],
                })
              "
              type="success"
              :icon="ElIconPlus"
            >
              NEW NKP
            </el-button>

            <el-input
              v-model="keyword"
              placeholder="Cari"
              style="width: 180px"
              :prefix-icon="ElIconSearch"
              :clearable="true"
              @clear="
                () => {
                  page = 1;
                  refreshData();
                }
              "
            />

            <el-button
              :icon="ElIconRefresh"
              @click="
                () => {
                  page = 1;
                  keyword = '';
                  refreshData();
                }
              "
            />
          </form>
        </template>
      </el-page-header>
    </template>

    <el-table
      stripe
      v-loading="isPending"
      :data="data?.data"
      @row-click="(row) => show(row.id)"
      table-layout="auto"
      height="calc(100vh - 198px)"
    >
      <el-table-column
        label="Status"
        align="center"
        header-align="center"
        width="190"
      >
        <template #default="{ row }">
          <StatusTag :status="row.status" style="width: 100%" /> <br />
          <el-text
            type="success"
            v-if="row.status == 'CLOSED'"
            class="line-clamp-1"
          >
            Ref no. {{ row.bankRefNo }}
          </el-text>
        </template>
      </el-table-column>

      <el-table-column label="Number">
        <template #default="{ row }">
          <el-tag class="font-mono hover:cursor-pointer font-semibold">
            {{ row.number }}
          </el-tag>
          <br />
          <span class="text-gray-400 text-sm">
            {{ formatDateLong(row.date) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Requester" width="220">
        <template #default="{ row }">
          <div v-if="row.Requester" class="flex items-center gap-2">
            <el-avatar
              size="small"
              class="shrink-0"
              :style="{ backgroundColor: getAvatarColor(row.Requester.name) }"
            >
              {{ row.Requester.name?.charAt(0).toUpperCase() }}
            </el-avatar>
            <span class="font-semibold text-sm line-clamp-1">
              {{ row.Requester.name }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Type">
        <template #default="{ row }">
          {{ row.paymentType }} <br />
          <el-tag
            :type="getNkpTypeStyle(row.nkpType)"
            size="small"
            round
            effect="plain"
          >
            {{ formatNkpType(row.nkpType) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Payment To" width="300">
        <template #default="{ row }">
          <div class="font-semibold line-clamp-1">
            {{
              row.paymentType == "EMPLOYEE"
                ? row.Employee?.name
                : row.Supplier?.name
            }}
          </div>
          <span class="text-gray-400">
            {{ row.Bank?.code }} - {{ row.bankAccount }} <br />
          </span>
          <el-tag v-if="row.invoiceNumber" type="warning" class="font-mono">
            Invoice No. {{ row.invoiceNumber }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Description" prop="description">
        <template #default="{ row }">
          <span class="whitespace-pre-line line-clamp-3">
            {{ row.description }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Amount" align="right" fixed="right">
        <template #default="{ row }">
          <el-tag type="success" class="font-mono" size="large" effect="plain">
            {{
              toCurrency(
                row.paymentType == "EMPLOYEE"
                  ? row.grandTotal
                  : row.finalPayment,
                row.currency,
              )
            }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="p-2 bg-slate-100"
      v-if="data?.total"
      size="small"
      background
      layout="total, sizes, prev, pager, next"
      :page-size="pageSize"
      :page-sizes="[10, 25, 50, 100]"
      :total="data?.total"
      @current-change="currentChange"
      @size-change="sizeChange"
    />

    <NkpForm />
    <NkpDetail />
  </NuxtLayout>
</template>

<script setup>
import { openDetail } from "~/stores/detail";
import { openForm } from "~/stores/form";

definePageMeta({
  layout: false,
});

const url = "/api/nkp";
const queryKey = "nkp";
const route = useRoute();
const {
  request,
  page,
  pageSize,
  keyword,
  sizeChange,
  currentChange,
  refreshData,
  fetchData,
  companyId,
} = useCrud({
  url,
  queryKey,
  defaultQuery: {
    orderBy: "updatedAt",
    orderDirection: "desc",
  },
});

// Helper function to format NKP type display
function formatNkpType(type) {
  if (!type) return "";
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// Helper function to get NKP type styling
function getNkpTypeStyle(type) {
  const styleMap = {
    CASH_ADVANCE: "primary",
    DECLARATION: "success",
    SALARY: "primary",
    DOWN_PAYMENT: "warning",
    SETTLEMENT: "danger",
  };

  return styleMap[type] || "warning";
}

onMounted(() => {
  const { number } = route.query;

  if (number) {
    request(`${url}/get-by-number`, { params: { number } }).then((result) => {
      openDetail(result);
    });
  }
});

watch(companyId, () => {
  page.value = 1;
  refreshData();
});

const { isPending, data } = fetchData();

function show(id) {
  const loading = ElLoading.service({
    lock: true,
    text: "Loading...",
  });

  request(`${url}/${id}`)
    .then((result) => {
      openDetail(result);
    })
    .finally(() => {
      loading.close();
    });
}
</script>
