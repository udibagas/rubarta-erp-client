<template>
  <el-page-header @back="goBack" content="NKP REPORT">
    <template #extra>
      <div class="flex">
        <el-radio-group v-model="filters.paymentType" class="mr-2">
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
          style="width: 200px"
          value-format="YYYY-MM-DD"
          format="DD/MM/YYYY"
          class="mr-2"
        />

        <el-dropdown
          split-button
          type="success"
          @command="download"
          class="mr-2"
        >
          <el-icon class="mr-2">
            <ElIconDownload />
          </el-icon>
          Download
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

        <el-input
          size="small"
          v-model="keyword"
          placeholder="Cari"
          style="width: 150px; margin-right: 5px"
          :prefix-icon="ElIconSearch"
          :clearable="true"
          @keydown.enter="
            () => {
              page = 1;
              refreshData();
            }
          "
          @clear="
            () => {
              page = 1;
              refreshData();
            }
          "
        >
        </el-input>

        <el-button
          :icon="ElIconRefresh"
          @click="
            () => {
              page = 1;
              keyword = '';
              refreshData();
            }
          "
        ></el-button>
      </div>
    </template>
  </el-page-header>

  <br />

  <el-table stripe v-loading="isPending" :data="data?.data" table-layout="auto">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Date" prop="number" width="120px">
      <template #default="{ row }">
        {{ formatDate(row.date) }}
      </template>
    </el-table-column>

    <el-table-column label="Number" prop="number">
      <template #default="{ row }">
        <el-tag class="font-mono">
          {{ row.number }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="Bank Ref No" prop="bankRefNo" width="200px" />

    <el-table-column
      v-if="filters.paymentType == 'VENDOR'"
      label="Invoice Number"
      prop="invoiceNumber"
      width="200"
    />

    <el-table-column label="Description" prop="description" min-width="150" />

    <el-table-column
      label="Amount"
      width="150"
      align="right"
      hader-align="right"
      fixed="right"
    >
      <template #default="{ row }">
        <el-tag type="success" class="font-mono">
          {{
            toCurrency(
              row.paymentType == "EMPLOYEE" ? row.grandTotal : row.finalPayment,
              row.currency
            )
          }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>

  <br />

  <el-pagination
    v-if="data?.total"
    size="small"
    background
    layout="total, sizes, prev, pager, next"
    :page-size="pageSize"
    :page-sizes="[10, 25, 50, 100]"
    :total="data?.total"
    @current-change="currentChange"
    @size-change="sizeChange"
  ></el-pagination>
</template>

<script setup>
import exportFromJSON from "export-from-json";
const config = useRuntimeConfig();
const url = "/api/nkp";
const queryKey = "nkp-report";

const {
  request,
  page,
  pageSize,
  companyId,
  filters,
  keyword,
  sizeChange,
  currentChange,
  refreshData,
  fetchData,
} = useCrud({
  url,
  queryKey,
  defaultQuery: {
    orderBy: "createdAt",
    orderDirection: "asc",
  },
});

watch(companyId, () => {
  page.value = 1;
  refreshData();
});

watch(
  () => filters.value.paymentType,
  () => {
    page.value = 1;
    refreshData();
  }
);

watch(
  () => filters.value.dateRange,
  () => {
    page.value = 1;
    refreshData();
  }
);

// Default filters
filters.value.paymentType = "ALL";
filters.value.action = "report";
filters.value.dateRange = null;
const { isPending, data } = fetchData();

async function download(format) {
  const params = {
    ...filters.value,
    format,
    companyId: companyId.value,
    action: "download",
  };

  if (format == "pdf") {
    const query = new URLSearchParams(params).toString();
    return window.open(
      new URL(`${config.public.apiBase}/api/nkp?${query}`),
      "_blank"
    );
  }

  if (format == "excel") {
    try {
      const data = await request(url, { params });
      exportFromJSON({
        fileName: "report-nkp",
        exportType: "xls",
        data: data.map((el, index) => {
          return {
            No: ++index,
            Date: el.date.slice(0, 10),
            Number: el.number,
            Type: `${el.paymentType} / ${el.nkpType}`,
            "Bank Ref No.": el.bankRefNo,
            "Invoice No.": el.invoiceNumber ?? "",
            Description: el.description,
            Amount: el.finalPayment > 0 ? el.finalPayment : el.grandTotal,
            Curr: el.currency,
          };
        }),
      });
    } catch (error) {
      console.log(error);
    }
  }
}
</script>

<style scoped>
.mb-0 {
  margin-bottom: 0;
}
</style>
