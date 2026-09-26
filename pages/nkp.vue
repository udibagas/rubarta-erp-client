<template>
  <NuxtLayout name="default">
    <template #header>
      <el-page-header @back="goBack" content="Nota Kuasa Pembayaran (NKP)">
        <template #extra>
          <div class="flex items-center gap-2">
            <el-dropdown split-button @command="download">
              <el-icon class="mr-2">
                <ElIconDownload />
              </el-icon>
              Export
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pdf" :icon="ElIconDocument">
                    PDF
                  </el-dropdown-item>
                  <el-dropdown-item command="excel" :icon="ElIconMemo">
                    Excel
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

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
          </div>
        </template>
      </el-page-header>
    </template>

    <div
      class="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border-b border-gray-300"
    >
      <div class="flex items-center gap-2">
        <el-radio-group
          v-model="filters.paymentType"
          class="mr-2"
          fill="rgb(149, 212, 117)"
          @change="refetch()"
        >
          <el-radio-button value="ALL">ALL</el-radio-button>
          <el-radio-button value="EMPLOYEE">EMPLOYEE</el-radio-button>
          <el-radio-button value="VENDOR">VENDOR</el-radio-button>
        </el-radio-group>

        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="Start"
          end-placeholder="End"
          value-format="YYYY-MM-DD"
          format="DD-MMM-YYYY"
          @change="refetch()"
          class="w-70!"
        />
      </div>

      <el-input
        v-model="keyword"
        @change="refetch()"
        placeholder="Search"
        clearable
        :prefix-icon="ElIconSearch"
        class="w-50! ml-auto"
      />

      <el-button @click="refetch()" :icon="ElIconRefresh" />
    </div>

    <el-table
      stripe
      v-loading="isPending"
      :data="data?.data"
      height="calc(100vh - 254px)"
      @filter-change="filterChange"
    >
      <el-table-column
        label="Status"
        align="center"
        header-align="center"
        column-key="status"
        width="180"
        fixed="left"
        :filters="
          [
            'DRAFT',
            'SUBMITTED',
            'PARTIALLY_APPROVED',
            'FULLY_APPROVED',
            'REJECTED',
            'VERIFIED',
            'AUTHORIZED',
            'PAID',
            'CLOSED',
          ].map((s) => ({ text: s, value: s }))
        "
      >
        <template #default="{ row }">
          <StatusTag :status="row.status" style="width: 100%" />
        </template>
      </el-table-column>

      <el-table-column label="Number" width="260" fixed="left">
        <template #default="{ row }">
          <div
            class="font-mono cursor-pointer hover:underline font-semibold"
            @click="show(row.id)"
          >
            {{ row.number }}
          </div>
          <div
            v-if="row.status == 'CLOSED'"
            class="line-clamp-1 text-green-500"
          >
            Ref no. {{ row.bankRefNo }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Requester" width="180">
        <template #default="{ row }">
          <div class="line-clamp-1">
            {{ row.Requester.name }}
          </div>
          <div class="text-gray-400">
            {{ formatDate(row.date) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Type" width="150" align="center">
        <template #default="{ row }">
          <!-- {{ row.paymentType }} <br /> -->
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
          <div v-if="row.invoiceNumber" class="text-yellow-500">
            Invoice No. {{ row.invoiceNumber }}
          </div>
          <span v-else class="text-gray-400">
            {{ row.Bank?.code }} - {{ row.bankAccount }} <br />
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Description" prop="description" min-width="250">
        <template #default="{ row }">
          <span class="whitespace-pre-line line-clamp-3 text-xs">
            {{ row.description }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        label="Amount"
        align="right"
        fixed="right"
        min-width="150"
      >
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
      :current-page="page"
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
const config = useRuntimeConfig();

const {
  request,
  page,
  pageSize,
  keyword,
  filters,
  sizeChange,
  companyId,
  currentChange,
  filterChange,
  fetchData,
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
  refetch();
});

filters.value.paymentType = "ALL";
filters.value.action = "report";
filters.value.dateRange = null;
const { isPending, data, refetch } = fetchData();

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

async function download(format) {
  const params = {
    ...filters.value,
    format,
    companyId: companyId.value,
    action: "download",
  };

  const query = new URLSearchParams(params).toString();
  return window.open(
    new URL(`${config.public.apiBase}/api/nkp?${query}`),
    "_blank",
  );
}
</script>
