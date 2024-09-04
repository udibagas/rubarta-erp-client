<template>
  <el-page-header @back="goBack" content="NKP">
    <template #extra>
      <form @submit.prevent="refreshData()">
        <el-radio-group v-model="filter.paymentType" @change="getData">
          <el-radio value="EMPLOYEE">EMPLOYEE</el-radio>
          <el-radio value="VENDOR">VENDOR</el-radio>
        </el-radio-group>
      </form>
    </template>
  </el-page-header>

  <br />

  <el-table
    stripe
    v-loading="isPending"
    :data="data?.data"
    @row-click="(row) => show(row.id)"
  >
    <el-table-column type="index" label="#"></el-table-column>

    <el-table-column
      label="Status"
      align="center"
      header-align="center"
      width="180"
    >
      <template #default="{ row }">
        <StatusTag :status="row.status" style="width: 100%" /> <br />
      </template>
    </el-table-column>

    <el-table-column label="Date" prop="number" width="150">
      <template #default="{ row }">
        {{ formatDateLong(row.date) }}
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

const { refreshData, sizeChange, currentChange, page, pageSize, keyword } =
  useCrud({ url, queryKey: "payment-authorizations" });

const { isPending, data } = useQuery({
  queryKey: ["payment-authorizations"],
  queryFn: () =>
    request(url, {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        keyword: keyword.value,
        companyId: companyId.value,
      },
    }),
});

watch(companyId, () => {
  refreshData("payment-authorizations");
});
</script>
