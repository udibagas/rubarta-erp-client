<template>
  <el-page-header @back="goBack" content="NKP REPORT">
    <template #extra>
      <div class="flex">
        <el-radio-group
          v-model="paymentType"
          @change="refreshData"
          size="small"
          class="mr-2"
        >
          <el-radio-button value="ALL">ALL</el-radio-button>
          <el-radio-button value="EMPLOYEE">EMPLOYEE</el-radio-button>
          <el-radio-button value="VENDOR">VENDOR</el-radio-button>
        </el-radio-group>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="Start"
          end-placeholder="End"
          @change="refreshData"
          size="small"
          style="width: 200px"
          value-format="YYYY-MM-DD"
          format="DD/MM/YYYY"
          class="mr-2"
        />

        <el-dropdown
          split-button
          type="success"
          size="small"
          @command="download"
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
      </div>
    </template>
  </el-page-header>

  <br />

  <el-table stripe v-loading="isPending" :data="data?.data">
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column label="Date" prop="number" width="110">
      <template #default="{ row }">
        {{ formatDate(row.date) }}
      </template>
    </el-table-column>

    <el-table-column label="Number" prop="number" width="220" />

    <el-table-column label="Description" prop="description" min-width="150" />

    <el-table-column
      label="Amount"
      width="150"
      align="right"
      hader-align="right"
      fixed="right"
    >
      <template #default="{ row }">
        <strong>{{ toDecimal(row.finalPayment) }}</strong>
      </template>
    </el-table-column>

    <el-table-column
      label="Curr"
      prop="currency"
      width="70"
      align="center"
      header-align="center"
      fixed="right"
    />
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
const companyId = ref(useCookie("companyId"));
const url = "/api/payment-authorizations";
const request = useRequest();
const queryClient = useQueryClient();
const paymentType = ref("ALL");
const page = ref(1);
const pageSize = ref(10);
const dateRange = ref(null);

watch(companyId, refreshData);

const { isPending, data } = useQuery({
  queryKey: ["payment-authorizations-report"],
  queryFn: () =>
    request(url, {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        companyId: companyId.value,
        dateRange: dateRange.value,
        paymentType: paymentType.value,
      },
    }),
});

function sizeChange(size) {
  pageSize.value = size;
  refreshData();
}

function currentChange(currentPage) {
  page.value = currentPage;
  refreshData();
}

function refreshData() {
  queryClient.invalidateQueries({
    queryKey: ["payment-authorizations-report"],
  });
}

async function download(format) {
  try {
    const data = await request(url, {
      params: {
        companyId: companyId.value,
        dateRange: dateRange.value,
        paymentType: paymentType.value,
        action: "download",
        format,
      },
    });

    console.log(data);
  } catch (error) {
    console.log(error);
  }
}
</script>

<style scoped>
.mb-0 {
  margin-bottom: 0;
}
</style>
