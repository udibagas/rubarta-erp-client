<template>
  <el-page-header @back="goBack" content="NKP">
    <template #extra>
      <form @submit.prevent="refreshData()">
        <el-button
          size="small"
          @click="
            openForm({
              companyId: companyId,
              deduction: 0,
              PaymentAuthorizationItem: [
                { date: undefined, description: undefined, amount: 0 },
              ],
            })
          "
          type="success"
          :icon="ElIconPlus"
          class="mr-2"
        >
          NEW NKP
        </el-button>

        <el-input
          size="small"
          v-model="keyword"
          placeholder="Cari"
          style="width: 180px"
          :prefix-icon="ElIconSearch"
          :clearable="true"
          @clear="refreshData()"
        >
        </el-input>
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
        <StatusTag :status="row.status" style="width: 100%" />
      </template>
    </el-table-column>

    <el-table-column label="Number" width="220">
      <template #default="{ row }">
        <strong>{{ row.number }}</strong>
        <br />
        {{ formatDateLong(row.date) }}
      </template>
    </el-table-column>

    <el-table-column label="Requester" min-width="150">
      <template #default="{ row }">
        <strong>{{ row.Requester?.name }}</strong
        ><br />
        {{ row.Company?.name }}
      </template>
    </el-table-column>

    <el-table-column label="Type" prop="paymentType" width="110" />

    <el-table-column label="Peyment To" min-width="150">
      <template #default="{ row }">
        <strong>
          {{
            row.paymentType == "EMPLOYEE"
              ? row.Employee?.name
              : row.Supplier?.name
          }}
        </strong>
        <br />
        {{ row.Bank?.code }} - {{ row.bankAccount }}
      </template>
    </el-table-column>

    <el-table-column
      label="Final Payment"
      width="150"
      align="right"
      hader-align="right"
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

  <NkpForm />
  <NkpDetail />
</template>

<script setup>
import { openDetail } from "~/stores/detail";
const companyId = ref(useCookie("companyId"));
const url = "/api/payment-authorizations";

const {
  openForm,
  refreshData,
  sizeChange,
  currentChange,
  request,
  page,
  pageSize,
  keyword,
} = useCrud({ url, queryKey: "payment-authorizations" });

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

function show(id) {
  request(`${url}/${id}`).then((result) => {
    openDetail(result);
  });
}
</script>
