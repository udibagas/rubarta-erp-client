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
              cashAdvanceBalance: 0,
              deduction: 0,
              tax: 0,
              downPayment: 0,
              NkpItem: [{ date: undefined, description: undefined, amount: 0 }],
              NkpAttachment: [],
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
          style="width: 180px; margin-right: 5px"
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

        <el-button
          :icon="ElIconRefresh"
          size="small"
          @click="
            () => {
              page = 1;
              keyword = '';
              refreshData();
            }
          "
        ></el-button>
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

    <el-table-column label="Number" width="240">
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

    <el-table-column label="Type" width="150">
      <template #default="{ row }">
        {{ row.paymentType }} <br />
        {{ row.nkpType?.replace("_", " ") }}
      </template>
    </el-table-column>

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
        {{ row.Bank?.code }} - {{ row.bankAccount }} <br />
        <span v-if="row.invoiceNumber"
          >Invoice No. {{ row.invoiceNumber }}</span
        >
      </template>
    </el-table-column>

    <el-table-column label="Description" prop="description" min-width="150" />

    <el-table-column
      label="Amount"
      width="130"
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
} = useCrud({ url, queryKey });

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
