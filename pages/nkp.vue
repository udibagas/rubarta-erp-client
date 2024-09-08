<template>
  <el-page-header @back="goBack" content="NKP">
    <template #extra>
      <form
        @submit.prevent="
          () => {
            page = 1;
            refreshData();
          }
        "
      >
        <el-button
          size="small"
          @click="
            openForm({
              companyId: companyId,
              cashAdvance: 0,
              deduction: 0,
              tax: 0,
              downPayment: 0,
              PaymentAuthorizationItem: [
                { date: undefined, description: undefined, amount: 0 },
              ],
              PaymentAuthorizationAttachment: [],
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
          @clear="
            () => {
              page = 1;
              refreshData();
            }
          "
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
        <StatusTag :status="row.status" style="width: 100%" /> <br />
        <el-text type="success" v-if="row.status == 'CLOSED'">
          Ref no. {{ row.bankRefNo }}
        </el-text>
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

    <el-table-column label="Payment To" min-width="150">
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

    <el-table-column label="Description" prop="description" min-width="150" />

    <el-table-column
      label="Amount"
      width="150"
      align="right"
      hader-align="right"
      fixed="right"
    >
      <template #default="{ row }">
        <strong>{{
          toDecimal(
            row.paymentType == "EMPLOYEE" ? row.grandTotal : row.finalPayment
          )
        }}</strong>
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

  <NkpForm />
  <NkpDetail />
</template>

<script setup>
import { openDetail } from "~/stores/detail";
import { openForm } from "~/stores/form";
const url = "/api/payment-authorizations";
const route = useRoute();
const queryClient = useQueryClient();
const request = useRequest();
const companyId = ref(useCookie("companyId"));
const page = ref(1);
const pageSize = ref(10);
const keyword = ref("");

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

function sizeChange(size) {
  page.value = 1;
  pageSize.value = size;
  refreshData();
}

function currentChange(currentPage) {
  page.value = currentPage;
  refreshData();
}

function refreshData() {
  queryClient.invalidateQueries({
    queryKey: ["payment-authorizations"],
  });
}

function show(id) {
  request(`${url}/${id}`).then((result) => {
    openDetail(result);
  });
}
</script>
