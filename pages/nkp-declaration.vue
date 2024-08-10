<template>
  <el-page-header @back="goBack" content=" NKP Declaration">
    <template #extra>
      <form @submit.prevent="refreshData()">
        <el-button
          size="small"
          @click="
            openForm({
              cashAdvance: 0,
              companyId: companyId,
              departmentId: user.departmentId,
              ExpenseClaimItem: [
                {
                  date: undefined,
                  expenseTypeId: undefined,
                  description: undefined,
                  amount: 0,
                },
              ],
            })
          "
          type="success"
          :icon="ElIconPlus"
          class="mr-2"
        >
          NEW EXPENSE CLAIM
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
      width="180"
      align="center"
      header-align="center"
    >
      <template #default="{ row }">
        <StatusTag :status="row.status" style="width: 100%" />
      </template>
    </el-table-column>

    <el-table-column label="Number" width="200">
      <template #default="{ row }">
        <strong>{{ row.number }}</strong> <br />
        {{ formatDateLong(row.date) }}
      </template>
    </el-table-column>

    <el-table-column label="Employee" min-width="170">
      <template #default="{ row }">
        <strong>{{ row.User?.name }}</strong> <br />
      </template>
    </el-table-column>

    <el-table-column label="Company" min-width="170">
      <template #default="{ row }">
        {{ row.Company?.name }} <br />
        {{ row.Department?.name }}
      </template>
    </el-table-column>

    <el-table-column
      label="Cash Advance"
      width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        {{ toCurrency(row.cashAdvance) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Total Amount"
      width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        {{ toCurrency(row.totalAmount) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Claim Amount"
      width="150"
      align="right"
      header-align="right"
    >
      <template #default="{ row }">
        <strong :class="row.claim > 0 ? 'text-success' : 'text-danger'">
          {{ toCurrency(row.claim) }}
        </strong>
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

  <NkpDeclarationForm />
  <NkpDeclarationDetail />
</template>

<script setup>
import { openDetail } from "~/stores/detail";

const { user } = useSanctumAuth();
const companyId = ref(useCookie("companyId"));
const url = "/api/expense-claims";

const {
  openForm,
  refreshData,
  currentChange,
  sizeChange,
  request,
  page,
  pageSize,
  keyword,
} = useCrud({
  url,
  queryKey: "expense-claims",
});

const { isPending, data } = useQuery({
  queryKey: ["expense-claims"],
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
  refreshData("expense-claims");
});

function show(id) {
  request(`${url}/${id}`).then((result) => {
    openDetail(result);
  });
}
</script>
